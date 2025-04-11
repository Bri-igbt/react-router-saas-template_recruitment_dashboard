import { Outlet } from 'react-router';

export default function SettingsLayout() {
  return (
    <div>
      <header className="sr-only">
        <h1>Settings</h1>
      </header>

      <main>
        <Outlet />
      </main>
    </div>
  );
}
