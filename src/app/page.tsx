import Link from 'next/link';
// import Scene from './render/page';
import Scene from "@/components/3js/3Dcar"

export default function Home() {
  return (
    <div className = "text-2xl" > 
      <div className ="grid grid-cols-1 grid-flow-row gap-4"> 
        <div>
          Go to <Link className="dashboard text-2xl underline text-blue-600 hover:text-blue-800 visited:text-purple-600" href = "/dashboard">DashBoard</Link>!
        </div>

        <div>
          Go to <Link className="team text-2xl underline text-blue-600 hover:text-blue-800 visited:text-purple-600" href = "/team-view">team-view</Link>!
        </div> 
        <div>
          Go to <Link className="docs text-2xl underline text-blue-600 hover:text-blue-800 visited:text-purple-600" href = "https://smv.seas.ucla.edu/info/">Documentation</Link>!
        </div> 
        <div className="render-box">
            <Scene/>
        </div>
      </div> 
    </div>
  );
}
