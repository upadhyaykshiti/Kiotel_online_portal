// // src/context/AuthContext.js
// "use client"
// // src/context/AuthContext.js
// import React, { createContext, useContext, useState, useEffect } from 'react';
// import { useSession, SessionProvider } from 'next-auth/react';

// const AuthContext = createContext();

// export const AuthProvider = ({ children }) => {
  
//   const [user, setUser] = useState(null);


//   useEffect(() => {
//     if (status === 'authenticated') {
//       setUser(session.user);
//     } else {
//       setUser(null);
//     }
//   }, [session, status]);

//   return (
//     <SessionProvider session={session}>
//       <AuthContext.Provider value={{ user, setUser }}>
//         {children}
//       </AuthContext.Provider>
//     </SessionProvider>
//   );
// };

// export const useAuth = () => {
//   return useContext(AuthContext);
// };