import Image from "next/image";
import Link from 'next/link'

export default function Home() {
  return (
    <div className = "text-2xl" > 
      <div className ="grid grid-cols-2 grid-flow-row gap-4"> 
        <div>
          Go to 
          <Link className="text-2xl" className="underline text-blue-600 hover:text-blue-800 visited:text-purple-600" href = "/dashboard"> DashBoard</Link>
          !
        </div>

        <div>
          Go to 
          <Link className = "text-2xl" className="underline text-blue-600 hover:text-blue-800 visited:text-purple-600" href = "/team-view"> team-view</Link>
          !
        </div> 
      </div> 
    </div>
  );
}
