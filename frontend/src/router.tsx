import { createBrowserRouter, Navigate } from "react-router-dom";
import { DashboardLayout } from "./components/layout/DashboardLayout";
import { PlansListPage } from "./features/training-plans/views/PlansListPage";
import { PlanCreatePage } from "./features/training-plans/pages/PlanCreatePage";
import { PlanDetailsPage } from "./features/training-plans/pages/PlanDetailsPage";
import { FormationsListPage } from "./features/formations/pages/FormationsListPage";
import { FormationCreatePage } from "./features/formations/pages/FormationCreatePage";
import { FormationDetailsPage } from "./features/formations/pages/FormationDetailsPage";
import { SitesPage } from "./features/sites/pages/SitesPage";
import { AccommodationsPage } from "./features/accommodations/pages/AccommodationsPage";
import { DirectionsPage } from "./features/directions/pages/DirectionsPage";
import { CentresPage } from "./features/centres/pages/CentresPage";
import { UsersPage } from "./features/users/pages/UsersPage";
import { DashboardPage } from "./features/dashboard/pages/DashboardPage";
import { SettingsPage } from "./features/settings/pages/SettingsPage";
import { RoleGuard } from "./components/auth/RoleGuard";
import { LoginPage } from "./features/auth/pages/LoginPage";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/",
    element: (
      <RoleGuard>
        <DashboardLayout />
      </RoleGuard>
    ),
    children: [
      {
        path: "settings",
        element: <SettingsPage />,
      },
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: "dashboard",
        element: <DashboardPage />,
      },
      {
        path: "plans",
        element: (
          <RoleGuard allowedRoles={["responsable_dr", "responsable_cdc", "responsable_formation", "formateur_animateur", "formateur_participant"]}>
            <PlansListPage />
          </RoleGuard>
        ),
      },
      {
        path: "plans/new",
        element: (
          <RoleGuard allowedRoles={["responsable_dr", "responsable_cdc", "responsable_formation"]}>
            <PlanCreatePage />
          </RoleGuard>
        ),
      },
      {
        path: "plans/:id",
        element: (
          <RoleGuard allowedRoles={["responsable_dr", "responsable_cdc", "responsable_formation", "formateur_animateur", "formateur_participant"]}>
            <PlanDetailsPage />
          </RoleGuard>
        ),
      },
      {
        path: "formations",
        element: (
          <RoleGuard allowedRoles={["responsable_dr", "responsable_cdc", "responsable_formation", "formateur_animateur", "formateur_participant"]}>
            <FormationsListPage />
          </RoleGuard>
        ),
      },
      {
        path: "formations/new",
        element: (
          <RoleGuard allowedRoles={["responsable_cdc", "responsable_formation"]}>
            <FormationCreatePage />
          </RoleGuard>
        ),
      },
      {
        path: "formations/:id",
        element: (
          <RoleGuard allowedRoles={["responsable_dr", "responsable_cdc", "responsable_formation", "formateur_animateur", "formateur_participant"]}>
            <FormationDetailsPage />
          </RoleGuard>
        ),
      },
      {
        path: "sites",
        element: (
          <RoleGuard allowedRoles={["responsable_dr", "responsable_formation", "responsable_cdc"]}>
            <SitesPage />
          </RoleGuard>
        ),
      },
      {
        path: "accommodations",
        element: (
          <RoleGuard allowedRoles={["responsable_dr", "responsable_formation", "responsable_cdc"]}>
            <AccommodationsPage />
          </RoleGuard>
        ),
      },
      {
        path: "directions",
        element: (
          <RoleGuard allowedRoles={["responsable_dr", "responsable_formation"]}>
            <DirectionsPage />
          </RoleGuard>
        ),
      },
      {
        path: "centres",
        element: (
          <RoleGuard allowedRoles={["responsable_dr", "responsable_formation", "responsable_cdc"]}>
            <CentresPage />
          </RoleGuard>
        ),
      },
      {
        path: "users",
        element: (
          <RoleGuard allowedRoles={["responsable_formation"]}>
            <UsersPage />
          </RoleGuard>
        ),
      },
    ],
  },
]);
