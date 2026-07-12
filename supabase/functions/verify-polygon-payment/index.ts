import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { handleCors } from "../_shared/cors.ts";

const POLYGON_CHAIN_ID = 137;

// Decimals lookup
const getDecimals = (asset: string): number => {
  const upper = asset.toUpperCase();
  if (upper === "USDT" || upper === "USDC") {
    return 6;
  }
  return 18; // DAAR, POL/MATIC
};

// Check if token address matches expected asset
const isTokenMatched = (logAddress: string, asset: string): boolean => {
  const cleanAddr = logAddress.toLowerCase();
  const assetUpper = asset.toUpperCase();
  if (assetUpper === "USDT") {
    // Polygon USDT contract
    return cleanAddr === "0xc2132d05d31c914a87c6611c10748aeb04b58e8f";
  }
  if (assetUpper === "USDC") {
    // Polygon native USDC and bridged USDC (USDC.e) contracts
    return (
      cleanAddr === "0x3c499c542cef5e3811e1192ce70d8cc03d5c3359" ||
      cleanAddr === "0x2791bca1f2de4661ed88a30c99a7a9449aa84174"
    );
  }
  if (assetUpper === "DAAR") {
    // DAAR contract
    return cleanAddr === "0x8fe60b6f2dcbe68a1659b81175c665eb94015b16";
  }
  return false;
};

// JSON-RPC requester
async function callPolygonRPC(
  method: string,
  params: any[],
  rpcUrls: string[]
): Promise<any> {
  let lastError = null;
  for (const url of rpcUrls) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method,
          params,
        }),
      });
      if (!res.ok) continue;
      const json = await res.json();
      if (json.error) {
        throw new Error(`RPC error: ${JSON.stringify(json.error)}`);
      }
      return json.result;
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError || new Error(`Failed to call RPC method ${method} on all Polygon nodes`);
}

serve(async (req) => {
  const corsResult = handleCors(req);
  if (corsResult instanceof Response) {
    return corsResult;
  }
  const corsHeaders = corsResult.headers;

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const authHeader = req.headers.get("Authorization") || req.headers.get("authorization");
  if (!authHeader) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const { payment_intent_id } = await req.json();
    if (!payment_intent_id) {
      return new Response(JSON.stringify({ error: "Missing payment_intent_id" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? serviceRoleKey;

    // Initialize user client to verify JWT
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authError } = await userClient.auth.getUser();

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized: Invalid JWT" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Initialize service role client for secure reads and writes
    const serviceClient = createClient(supabaseUrl, serviceRoleKey);

    // Fetch intent
    const { data: intent, error: intentError } = await serviceClient
      .from("crypto_payment_intents")
      .select("*")
      .eq("id", payment_intent_id)
      .single();

    if (intentError || !intent) {
      return new Response(JSON.stringify({ error: "Payment intent not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Authorization check: User must own the intent OR be a Guardian admin
    const { data: profile } = await serviceClient
      .from("profiles")
      .select("role")
      .eq("user_id", user.id)
      .single();
    const isGuardian = profile?.role === "guardian";

    if (!isGuardian && intent.user_id !== user.id) {
      return new Response(JSON.stringify({ error: "Forbidden: Access denied" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check transaction hash
    if (!intent.tx_hash) {
      return new Response(JSON.stringify({ error: "No transaction hash submitted" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const cleanHash = intent.tx_hash.trim();
    if (!/^0x[a-fA-F0-9]{64}$/.test(cleanHash)) {
      return new Response(JSON.stringify({ error: "Invalid transaction hash format" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Block double spends: is there any OTHER confirmed intent with this same tx_hash?
    const { data: duplicateIntents } = await serviceClient
      .from("crypto_payment_intents")
      .select("id")
      .eq("tx_hash", cleanHash)
      .eq("status", "confirmed")
      .neq("id", payment_intent_id);

    if (duplicateIntents && duplicateIntents.length > 0) {
      const errorMsg = "Transaction hash already confirmed for another subscription.";
      await serviceClient
        .from("crypto_payment_intents")
        .update({
          verification_status: "failed",
          verification_checked_at: new Date().toISOString(),
          verification_error: errorMsg,
        })
        .eq("id", payment_intent_id);

      await serviceClient.from("audit_logs").insert({
        user_id: user.id,
        action: "crypto_payment_onchain_failed",
        target_type: "crypto_payment_intents",
        details: {
          payment_intent_id: payment_intent_id,
          subscription_id: intent.subscription_id,
          tx_hash: cleanHash,
          asset: intent.crypto_asset,
          amount: intent.amount_crypto,
          reason: "Double spend: tx_hash already confirmed",
        },
      });

      return new Response(JSON.stringify({ error: errorMsg }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Setup Polygon JSON-RPC nodes
    const configuredRpc = Deno.env.get("POLYGON_RPC_URL") ?? "";
    const rpcUrls = [
      configuredRpc,
      "https://polygon-rpc.com/",
      "https://rpc.ankr.com/polygon",
      "https://polygon.llamarpc.com",
    ].filter(Boolean);

    try {
      // 1. Fetch Transaction Details
      const tx = await callPolygonRPC("eth_getTransactionByHash", [cleanHash], rpcUrls);
      if (!tx) {
        throw new Error("Transaction not found on Polygon mainnet. Please wait for the transaction to propagate.");
      }

      // 2. Fetch Transaction Receipt
      const receipt = await callPolygonRPC("eth_getTransactionReceipt", [cleanHash], rpcUrls);
      if (!receipt) {
        throw new Error("Transaction receipt not found. Transaction might still be pending.");
      }

      // 3. Check Receipt Status
      if (receipt.status !== "0x1") {
        throw new Error("Transaction failed (reverted) on-chain.");
      }

      // 4. Check block timestamp to prevent submission of historic transactions
      const block = await callPolygonRPC("eth_getBlockByNumber", [receipt.blockNumber, false], rpcUrls);
      if (!block || !block.timestamp) {
        throw new Error("Failed to retrieve transaction block timestamp.");
      }
      const txTimestampSec = parseInt(block.timestamp, 16);
      const txDate = new Date(txTimestampSec * 1000);
      const intentCreatedDate = new Date(intent.created_at);
      const twoHoursMs = 2 * 60 * 60 * 1000;

      if (txDate.getTime() < intentCreatedDate.getTime() - twoHoursMs) {
        throw new Error(`Transaction timestamp (${txDate.toISOString()}) is older than payment intent creation time (${intentCreatedDate.toISOString()}).`);
      }

      // 5. Check Confirmations
      const currentBlockHex = await callPolygonRPC("eth_blockNumber", [], rpcUrls);
      const currentBlock = parseInt(currentBlockHex, 16);
      const txBlock = parseInt(receipt.blockNumber, 16);
      const confirmations = currentBlock - txBlock + 1;
      if (confirmations < 1) {
        throw new Error(`Insufficient block confirmations (${confirmations}).`);
      }

      // 6. Decode Assets, Recipient, and Value
      const intentAsset = intent.crypto_asset.toUpperCase();
      const targetRecipient = intent.wallet_to.toLowerCase();
      let decodedRecipient = "";
      let decodedAmountRaw = 0n;

      if (tx.input && tx.input.startsWith("0xa9059cbb")) {
        // ERC20 Transfer event (e.g. USDT, USDC, DAAR)
        const contractAddress = tx.to.toLowerCase();
        
        // Match token contract
        if (!isTokenMatched(contractAddress, intentAsset)) {
          throw new Error(`Token contract mismatch. Expected contract for asset ${intentAsset}.`);
        }

        // Search Transfer logs in receipt
        const transferEventTopic = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";
        let foundTransfer = false;

        for (const log of receipt.logs) {
          if (
            log.topics &&
            log.topics[0] === transferEventTopic &&
            log.address.toLowerCase() === contractAddress
          ) {
            // Recipient is padded address in topic 2
            const logRecipient = "0x" + log.topics[2].slice(26).toLowerCase();
            if (logRecipient === targetRecipient) {
              foundTransfer = true;
              const dataClean = log.data.startsWith("0x") ? log.data : "0x" + log.data;
              decodedAmountRaw = BigInt(dataClean === "0x" ? "0x0" : dataClean);
              decodedRecipient = logRecipient;
              break;
            }
          }
        }

        if (!foundTransfer) {
          throw new Error(`ERC20 Transfer log to treasury address (${targetRecipient}) not found in receipt.`);
        }
      } else {
        // Native POL/MATIC transfer
        if (intentAsset !== "POL" && intentAsset !== "MATIC") {
          throw new Error(`Asset mismatch. Expected native MATIC/POL transaction.`);
        }
        if (!tx.to) {
          throw new Error("Invalid native transaction: recipient address (to) is empty.");
        }
        decodedRecipient = tx.to.toLowerCase();
        decodedAmountRaw = BigInt(tx.value);

        if (decodedRecipient !== targetRecipient) {
          throw new Error(`Recipient address mismatch. Expected treasury ${targetRecipient}, got ${decodedRecipient}.`);
        }
      }

      // 7. Verify Amount
      const decimals = getDecimals(intentAsset);
      const expectedAmountRaw = BigInt(
        Math.floor(Number(intent.amount_crypto) * Math.pow(10, decimals))
      );

      if (decodedAmountRaw < expectedAmountRaw) {
        const expectedFriendly = Number(expectedAmountRaw) / Math.pow(10, decimals);
        const gotFriendly = Number(decodedAmountRaw) / Math.pow(10, decimals);
        throw new Error(`Amount too low. Expected at least ${expectedFriendly} ${intentAsset}, got ${gotFriendly}.`);
      }

      // 8. Sender Wallet check (if profile has wallet registered, match it. Otherwise bypass)
      const { data: userProfile } = await serviceClient
        .from("profiles")
        .select("wallet_address")
        .eq("user_id", intent.user_id)
        .single();

      if (
        userProfile?.wallet_address &&
        tx.from.toLowerCase() !== userProfile.wallet_address.toLowerCase()
      ) {
        // Safe-mode gating: Do not auto-approve, flag for manual review
        const errorMsg = `Sender wallet mismatch. Transaction sender is ${tx.from}, but profile wallet is ${userProfile.wallet_address}. Guardian review required.`;
        await serviceClient
          .from("crypto_payment_intents")
          .update({
            verification_status: "manual_review",
            verification_checked_at: new Date().toISOString(),
            verification_error: errorMsg,
            tx_from: tx.from,
            tx_to: tx.to || decodedRecipient,
            onchain_amount: Number(decodedAmountRaw) / Math.pow(10, decimals),
            block_number: txBlock,
            chain_id: POLYGON_CHAIN_ID,
            token_contract: tx.input && tx.input.startsWith("0xa9059cbb") ? tx.to.toLowerCase() : null,
            confirmations: confirmations,
          })
          .eq("id", payment_intent_id);

        await serviceClient.from("audit_logs").insert({
          user_id: user.id,
          action: "crypto_payment_onchain_manual_review",
          target_type: "crypto_payment_intents",
          details: {
            payment_intent_id: payment_intent_id,
            subscription_id: intent.subscription_id,
            tx_hash: cleanHash,
            asset: intent.crypto_asset,
            amount: intent.amount_crypto,
            reason: errorMsg,
          },
        });

        return new Response(
          JSON.stringify({
            status: "manual_review",
            error: errorMsg,
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // --- ALL CHECKS PASSED: AUTHORITATIVE CONFIRMATION ---
      const onchainAmountNumber = Number(decodedAmountRaw) / Math.pow(10, decimals);

      // 1. Update Payment Intent
      await serviceClient
        .from("crypto_payment_intents")
        .update({
          status: "confirmed",
          confirmed_at: new Date().toISOString(),
          verification_status: "verified",
          verification_checked_at: new Date().toISOString(),
          verification_error: null,
          verified_at: new Date().toISOString(),
          verified_by: "edge_function",
          block_number: txBlock,
          tx_from: tx.from,
          tx_to: tx.to || decodedRecipient,
          onchain_amount: onchainAmountNumber,
          chain_id: POLYGON_CHAIN_ID,
          token_contract: tx.input && tx.input.startsWith("0xa9059cbb") ? tx.to.toLowerCase() : null,
          confirmations: confirmations,
        })
        .eq("id", payment_intent_id);

      // 2. Update Subscription
      if (intent.subscription_id) {
        await serviceClient
          .from("microdao_subscriptions")
          .update({
            status: "active",
            current_period_start: new Date().toISOString(),
            current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
            updated_at: new Date().toISOString(),
          })
          .eq("id", intent.subscription_id);
      }

      // 3. Write Audit Log
      await serviceClient.from("audit_logs").insert({
        user_id: user.id,
        action: "crypto_payment_onchain_verified",
        target_type: "crypto_payment_intents",
        details: {
          payment_intent_id: payment_intent_id,
          subscription_id: intent.subscription_id,
          tx_hash: cleanHash,
          asset: intent.crypto_asset,
          amount: intent.amount_crypto,
          onchain_amount: onchainAmountNumber,
          chain_id: POLYGON_CHAIN_ID,
          block_number: txBlock,
          actor_user_id: user.id,
        },
      });

      return new Response(
        JSON.stringify({
          status: "verified",
          message: "Transaction verified successfully. Subscription activated.",
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } catch (err: any) {
      // Update verification status to failed
      const errorMsg = err.message || "Failed to verify transaction on-chain.";
      await serviceClient
        .from("crypto_payment_intents")
        .update({
          verification_status: "failed",
          verification_checked_at: new Date().toISOString(),
          verification_error: errorMsg,
        })
        .eq("id", payment_intent_id);

      // Log failure event
      await serviceClient.from("audit_logs").insert({
        user_id: user.id,
        action: "crypto_payment_onchain_failed",
        target_type: "crypto_payment_intents",
        details: {
          payment_intent_id: payment_intent_id,
          subscription_id: intent.subscription_id,
          tx_hash: cleanHash,
          asset: intent.crypto_asset,
          amount: intent.amount_crypto,
          reason: errorMsg,
        },
      });

      return new Response(
        JSON.stringify({
          status: "failed",
          error: errorMsg,
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
