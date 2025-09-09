import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FolderPlus, Folder } from "lucide-react";

export default function Projects() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Проекты</h1>
            <p className="text-muted-foreground">
              Управляйте своими проектами и документами
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="border-dashed border-2 hover:border-primary/50 transition-colors">
              <CardHeader className="text-center">
                <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <FolderPlus className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Создать проект</CardTitle>
                <CardDescription>
                  Начните новый проект с нуля
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" variant="outline">
                  Создать проект
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <Folder className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Пример проекта</CardTitle>
                    <CardDescription className="text-sm">
                      Обновлен 2 часа назад
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Демонстрационный проект для ознакомления с возможностями платформы.
                </p>
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline">
                    Открыть
                  </Button>
                  <Button size="sm" variant="ghost">
                    Настройки
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-12 text-center">
            <p className="text-muted-foreground">
              У вас пока нет проектов. Создайте первый проект, чтобы начать работу.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}