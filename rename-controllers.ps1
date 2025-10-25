# Script para renombrar controladores admin con prefijo admin-

$rootPath = "c:\Users\Bryan\OneDrive - ULEAM\Tareas\5to semestre\Aplicaciones para el servidor web\mesaYa\mesaYA_Res\src\features"

# Lista de módulos y controladores a renombrar
$controllers = @(
    @{Module="restaurants"; OldName="restaurants.controller.ts"; NewName="admin-restaurants.controller.ts"; ClassName="RestaurantsController"; NewClassName="AdminRestaurantsController"},
    @{Module="reservation"; OldName="reservations.controller.ts"; NewName="admin-reservations.controller.ts"; ClassName="ReservationsController"; NewClassName="AdminReservationsController"},
    @{Module="reviews"; OldName="reviews.controller.ts"; NewName="admin-reviews.controller.ts"; ClassName="ReviewsController"; NewClassName="AdminReviewsController"},
    @{Module="tables"; OldName="tables.controller.ts"; NewName="admin-tables.controller.ts"; ClassName="TablesController"; NewClassName="AdminTablesController"},
    @{Module="sections"; OldName="sections.controller.ts"; NewName="admin-sections.controller.ts"; ClassName="SectionsController"; NewClassName="AdminSectionsController"},
    @{Module="objects"; OldName="objects.controller.ts"; NewName="admin-objects.controller.ts"; ClassName="ObjectsController"; NewClassName="AdminObjectsController"},
    @{Module="section-objects"; OldName="section-objects.controller.ts"; NewName="admin-section-objects.controller.ts"; ClassName="SectionObjectsController"; NewClassName="AdminSectionObjectsController"},
    @{Module="images"; OldName="images.controller.ts"; NewName="admin-images.controller.ts"; ClassName="ImagesController"; NewClassName="AdminImagesController"},
    @{Module="payment"; OldName="payment.controller.ts"; NewName="admin-payment.controller.ts"; ClassName="PaymentController"; NewClassName="AdminPaymentController"}
)

foreach ($ctrl in $controllers) {
    $modulePath = Join-Path $rootPath $ctrl.Module
    $controllersPath = Join-Path $modulePath "interface\controllers\v1"

    # Si no existe la ruta con interface, probar con presentation
    if (-not (Test-Path $controllersPath)) {
        $controllersPath = Join-Path $modulePath "presentation\controllers\v1"
    }

    $oldFile = Join-Path $controllersPath $ctrl.OldName
    $newFile = Join-Path $controllersPath $ctrl.NewName

    if (Test-Path $oldFile) {
        Write-Host "Renombrando: $($ctrl.Module)/$($ctrl.OldName) -> $($ctrl.NewName)"

        # Leer contenido
        $content = Get-Content $oldFile -Raw

        # Reemplazar nombre de clase
        $content = $content -replace "export class $($ctrl.ClassName)", "export class $($ctrl.NewClassName)"

        # Guardar en nuevo archivo
        Set-Content -Path $newFile -Value $content -NoNewline

        # Eliminar archivo antiguo
        Remove-Item $oldFile

        Write-Host "✓ Completado: $($ctrl.Module)"
    } else {
        Write-Host "⚠ No encontrado: $oldFile"
    }
}

Write-Host "`n✅ Renombramiento de controladores completado!"
