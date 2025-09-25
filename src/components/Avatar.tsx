import { cn } from "@/lib/utils";

interface AvatarProps {
  user: {
    id?: string;
    display_name?: string;
    name?: string;
    avatar_url?: string;
    avatarUrl?: string;
  };
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  title?: string;
}

const AVATAR_COLORS = [
  'bg-primary',
  'bg-secondary', 
  'bg-accent',
  'bg-orange-500',
  'bg-yellow-500',
  'bg-indigo-500',
  'bg-pink-500',
  'bg-teal-500',
  'bg-orange-600',
  'bg-blue-600'
];

export const Avatar = ({ user, size = 'md', className, title }: AvatarProps) => {
  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm', 
    lg: 'w-8 h-8 text-sm' // Делаем lg размер 32x32px как md
  };

  const userName = user.display_name || user.name || 'У';
  const avatarUrl = user.avatar_url || user.avatarUrl;

  // Если есть URL аватара
  if (avatarUrl) {
    return (
      <img 
        src={avatarUrl} 
        alt={userName}
        title={title || userName}
        className={cn(
          'rounded-full object-cover border-2 border-background',
          sizeClasses[size],
          className
        )}
      />
    );
  }

  // Генерируем инициалы
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Выбираем цвет на основе имени пользователя
  const colorIndex = userName.length % AVATAR_COLORS.length;
  const backgroundColor = AVATAR_COLORS[colorIndex];

  return (
    <div 
      className={cn(
        'rounded-full flex items-center justify-center text-primary-foreground font-semibold border border-border shrink-0',
        backgroundColor,
        sizeClasses[size],
        className
      )}
      title={title || userName}
    >
      {getInitials(userName)}
    </div>
  );
};