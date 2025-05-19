import { Link, Outlet } from 'react-router-dom';

export default function Layout() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <nav className="bg-gray-800 p-4">
        <div className="container mx-auto flex justify-between items-center">
          <Link to="/" className="text-xl font-bold">NFT Workshop</Link>
          <div className="space-x-4">
            <Link to="/rust-stylus" className="hover:text-blue-400">Rust + Stylus</Link>
            <Link to="/solidity" className="hover:text-blue-400">Solidity</Link>
            <Link to="/solidity-stylus" className="hover:text-blue-400">Solidity + Stylus</Link>
          </div>
        </div>
      </nav>
      <main className="container mx-auto p-4">
        <Outlet />
      </main>
    </div>
  );
}
