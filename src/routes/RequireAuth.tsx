import { Navigate, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from '../lib/auth';
import { FullPageLoader } from '../components/ui/Feedback';

export default function RequireAuth({
  children,
  publisherOnly = false,
  adminOnly = false,
}: {
  children: ReactNode;
  publisherOnly?: boolean;
  adminOnly?: boolean;
}) {
  const { ready, session, isPublisher, isAdmin } = useAuth();
  const location = useLocation();

  if (!ready) return <FullPageLoader label="جارٍ التحقق من الجلسة" />;
  if (!session)
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  if (adminOnly && !isAdmin)
    return <Navigate to="/profile" replace state={{ adminOnly: true }} />;
  if (publisherOnly && !isPublisher)
    return <Navigate to="/profile" replace state={{ publisherOnly: true }} />;

  return <>{children}</>;
}
