import UserListPage from "../components/UserListPage.jsx";

export default function CustomerUsers() {
  // Customers self-register via OTP, so no "create" form is shown here — just the list.
  return <UserListPage title="Customers" roleName="CUSTOMER" allowCreate={false} />;
}
