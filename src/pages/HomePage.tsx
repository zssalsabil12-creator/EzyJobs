import HomeContent from '../components/home/HomePage';
import type { Job } from '../types';

/**
 * Public home route.
 * The actual visual system lives in components/home/HomePage so the route
 * and the design source cannot drift apart again.
 */
export default function HomePage({ jobs }: { jobs: Job[] }) {
  return <HomeContent jobs={jobs} />;
}
