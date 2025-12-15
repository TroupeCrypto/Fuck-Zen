export default function WarRoomPage() {
  return (
    <main style={{ padding: 24 }}>
      <h1 style={{ margin: 0 }}>War Room</h1>
      <p style={{ opacity: 0.8 }}>
        This route is protected by middleware. You must send an Authorization: Bearer token.
      </p>
    </main>
  );
}
