import CertificateTable from "../../components/CertificateTable";

// The Navbar is now handled globally in App.jsx.
// The Footer will be converted and re-integrated later.

export default function Homepage() {
  // The main layout (Container) is now handled by App.jsx.
  // This component just needs to render the page-specific content.
  return (
    <main>
      <CertificateTable />
    </main>
  );
}