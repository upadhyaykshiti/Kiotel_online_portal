// "use client"
// import { useState } from 'react';
// import Link from 'next/link';
// import { FaBell, FaUserCircle } from 'react-icons/fa';

// export default function Dashboard({ userEmail }) {
//   const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

//   const toggleProfileMenu = () => {
//     setIsProfileMenuOpen(!isProfileMenuOpen);
//   };

//   return (
    
//     <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
//       <div className="w-full max-w-4xl p-4 bg-white rounded-lg shadow-md">
//         <div className="flex justify-between items-center border-b pb-4 mb-4">
//           <div>
//             <h1 className="text-xl font-bold">Welcome, {userEmail}</h1>
//           </div>
//           <div className="flex items-center space-x-4">
//             <div className="relative">
//               <FaBell className="cursor-pointer text-2xl" />
//             </div>
//             <div className="relative">
//               <FaUserCircle 
//                 className="cursor-pointer text-2xl" 
//                 onClick={toggleProfileMenu}
//               />
//               {isProfileMenuOpen && (
//                 <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg">
//                   <Link href="/update-profile" legacyBehavior>
//                     <a className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
//                       Update Profile
//                     </a>
//                   </Link>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//         <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
//           <Link href="/helpdesk" className="block p-4 bg-blue-500 text-white text-center rounded-lg shadow hover:bg-blue-600">
//             Helpdesk
//           </Link>
//           <Link href="/hk-controller" className="block p-4 bg-green-500 text-white text-center rounded-lg shadow hover:bg-green-600">
//             HK Controller
//           </Link>
//           <Link href="/admin" className="block p-4 bg-red-500 text-white text-center rounded-lg shadow hover:bg-red-600">
//             Admin
//           </Link>
//         </div>
//       </div>
//     </div>
//   );
// }


"use client";
import { useState } from 'react';
import Link from 'next/link';
import { FaBell, FaUserCircle } from 'react-icons/fa';

export default function Dashboard({ userEmail }) {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const toggleProfileMenu = () => {
    setIsProfileMenuOpen(!isProfileMenuOpen);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="w-full min-h-screen p-4 bg-white rounded-lg shadow-md">
        <div className="flex justify-between items-center border-b pb-4 mb-4">
          <div>
            <h1 className="text-xl font-bold">Welcome, {userEmail}</h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <FaBell className="cursor-pointer text-2xl" />
            </div>
            <div className="relative">
              <FaUserCircle 
                className="cursor-pointer text-2xl" 
                onClick={toggleProfileMenu}
              />
              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg">
                  <Link href="/update-profile" legacyBehavior>
                    <a className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Update Profile
                    </a>
                  </Link>
                  <Link href="/sign-in" legacyBehavior>
                    <a className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Logout
                    </a>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Link href="/Helpdesk" className="block p-4 bg-blue-500 text-white text-center rounded-lg shadow hover:bg-blue-600">
            Helpdesk
          </Link>
          <Link href="/hk-controller" className="block p-4 bg-green-500 text-white text-center rounded-lg shadow hover:bg-green-600">
            HK Controller
          </Link>
          <Link href="/admin" className="block p-4 bg-red-500 text-white text-center rounded-lg shadow hover:bg-red-600">
            Admin
          </Link>
        </div>
      </div>
    </div>
  );
}




// "use client";
// import { useState } from 'react';
// import Link from 'next/link';
// import { FaBell, FaUserCircle } from 'react-icons/fa';

// export default function Dashboard({ userEmail }) {
//   const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

//   const toggleProfileMenu = () => {
//     setIsProfileMenuOpen(!isProfileMenuOpen);
//   };

//   return (
//     <div className="min-h-screen bg-gray-100">
//       <div className="w-full min-h-screen p-4 bg-white rounded-lg shadow-md">
//         <div className="flex justify-between items-center border-b pb-4 mb-4">
//           <div>
//             <h1 className="text-xl font-bold">Welcome, {userEmail}</h1>
//           </div>
//           <div className="flex items-center space-x-4">
//             <div className="relative">
//               <FaBell className="cursor-pointer text-2xl" />
//             </div>
//             <div className="relative">
//               <FaUserCircle 
//                 className="cursor-pointer text-2xl" 
//                 onClick={toggleProfileMenu}
//               />
//               {isProfileMenuOpen && (
//                 <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg">
//                   <Link href="/update-profile" legacyBehavior>
//                     <a className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
//                       Update Profile
//                     </a>
//                   </Link>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//         <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
//           <Link href="/helpdesk" className="block p-4 bg-blue-500 text-white text-center rounded-lg shadow hover:bg-blue-600">
//             Helpdesk
//           </Link>
//           <Link href="/hk-controller" className="block p-4 bg-green-500 text-white text-center rounded-lg shadow hover:bg-green-600">
//             HK Controller
//           </Link>
//           <Link href="/admin" className="block p-4 bg-red-500 text-white text-center rounded-lg shadow hover:bg-red-600">
//             Admin
//           </Link>
//         </div>
//         <div className="mt-8 flex justify-center">
//           <img 
//             src="/assets/koitel1.jpeg" 
//             alt="Descriptive Alt Text" 
//             className="max-w-full h-auto rounded-lg shadow-md"
//           />
//         </div>
//       </div>
//     </div>
//   );
// }




// "use client";
// import { useState } from 'react';
// import Link from 'next/link';
// import { FaBell, FaUserCircle } from 'react-icons/fa';

// export default function Dashboard({ userEmail }) {
//   const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

//   const toggleProfileMenu = () => {
//     setIsProfileMenuOpen(!isProfileMenuOpen);
//   };

//   return (
//     <div className="min-h-screen bg-gray-100">
//       <div className="w-full min-h-screen p-4 bg-white rounded-lg shadow-md relative">
//         <div className="absolute top-4 right-4 flex items-center space-x-4">
//           <div className="relative">
//             <FaBell className="cursor-pointer text-2xl" />
//           </div>
//           <div className="relative">
//             <FaUserCircle 
//               className="cursor-pointer text-2xl" 
//               onClick={toggleProfileMenu}
//             />
//             {isProfileMenuOpen && (
//               <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg">
//                 <Link href="/update-profile" legacyBehavior>
//                   <a className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
//                     Update Profile
//                   </a>
//                 </Link>
//               </div>
//             )}
//           </div>
//         </div>
//         <div className="flex justify-center mt-16 mb-8">
//           <img 
//             src="/assets/koitel2.jpeg" 
//             alt="Descriptive Alt Text" 
//             className="w-full max-w-lg rounded-lg"
//           />
//         </div>
//         <div className="text-center mb-8">
//           <h1 className="text-xl font-bold">Welcome, {userEmail}</h1>
//         </div>
//         <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
//           <Link href="/helpdesk" className="block p-4 bg-violet-500 text-white text-center rounded-lg shadow hover:bg-yellow-700">
//             Helpdesk
//           </Link>
//           <Link href="/hk-controller" className="block p-4 bg-green-500 text-white text-center rounded-lg shadow hover:bg-green-700">
//             HK Controller
//           </Link>
//           <Link href="/admin" className="block p-4 bg-pink-500 text-white text-center rounded-lg shadow hover:bg-pink-700">
//             Admin
//           </Link>
//         </div>
//       </div>
//     </div>
//   );
// }


// "use client";
// import { useState } from 'react';
// import Link from 'next/link';
// import { FaBell, FaUserCircle } from 'react-icons/fa';

// export default function Dashboard({ userEmail }) {
//   const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

//   const toggleProfileMenu = () => {
//     setIsProfileMenuOpen(!isProfileMenuOpen);
//   };

//   return (
//     <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 bg-cover bg-center" style={{ backgroundImage: "url('/assets/koitel2.jpeg')" }}>
//       <div className="w-full max-w-4xl p-4 bg-white bg-opacity-80 rounded-lg shadow-md">
//         <div className="flex justify-between items-center border-b pb-4 mb-4">
//           <div>
//             <h1 className="text-xl font-bold">Welcome, {userEmail}</h1>
//           </div>
//           <div className="flex items-center space-x-4">
//             <div className="relative">
//               <FaBell className="cursor-pointer text-2xl" />
//             </div>
//             <div className="relative">
//               <FaUserCircle
//                 className="cursor-pointer text-2xl"
//                 onClick={toggleProfileMenu}
//               />
//               {isProfileMenuOpen && (
//                 <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg">
//                   <Link href="/update-profile" legacyBehavior>
//                     <a className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
//                       Update Profile
//                     </a>
//                   </Link>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//         <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
//           <Link href="/helpdesk" className="block p-4 bg-blue-500 text-white text-center rounded-lg shadow hover:bg-blue-600 font-bold">
//             Helpdesk
//           </Link>
//           <Link href="/hk-controller" className="block p-4 bg-green-500 text-white text-center rounded-lg shadow hover:bg-green-600 font-bold">
//             HK Controller
//           </Link>
//           <Link href="/admin" className="block p-4 bg-red-500 text-white text-center rounded-lg shadow hover:bg-red-600 font-bold">
//             Admin
//           </Link>
//         </div>
//       </div>
//     </div>
//   );
// }

