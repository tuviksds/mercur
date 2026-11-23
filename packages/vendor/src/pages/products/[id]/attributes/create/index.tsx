// Route: /products/:id/attributes/create
import { SectionNoAccess, useCan, usePermissions } from "@mercurjs/dashboard-shared"
import { Heading } from "@medusajs/ui"
import { useTranslation } from "react-i18next"
import { useParams } from "react-router-dom"

import { RouteDrawer } from "@components/modals"
import { CreateAttributeForm } from "./components/create-attribute-form"

export const Component = () => {
  const { id } = useParams()
  const { t } = useTranslation()
  const { isLoading: permissionsLoading } = usePermissions()
  const canEditDefinitions = useCan("product_attributes", "edit") && !permissionsLoading

  return (
    <RouteDrawer>
      <RouteDrawer.Header>
        <RouteDrawer.Title asChild>
          <Heading>{t("products.addAttribute")}</Heading>
        </RouteDrawer.Title>
      </RouteDrawer.Header>
      {canEditDefinitions ? <CreateAttributeForm productId={id!} /> : <SectionNoAccess />}
    </RouteDrawer>
  )
}
