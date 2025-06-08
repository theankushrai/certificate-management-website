import {Footer,Navbar,CertificateTable} from "../components";
export default function Homepage() {
    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
                {/* pt-24 = Navbar height (h-16 = 4rem = 64px) + extra padding (e.g., 32px). Adjust as needed. h-16 is 4rem. 4rem + 2rem (for py-8) = 6rem. 6*16 = 96px. pt-24 is 6rem. */}
                <CertificateTable />
            </main>
            <Footer />
        </div>
    );
}