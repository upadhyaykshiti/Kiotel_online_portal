// import { Inter } from "next/font/google";
// import "./globals.css";
// import SocketProvider from "./(portal)/compo/SocketProvider"; 
// const inter = Inter({ subsets: ["latin"] });

// export const metadata = {
//   title: "Kiotel",
//   description: "Kiotel tickets",
//   icons: {
//     icon: "/favicon.ico", // or use .png, .svg if you prefer
//   },
// };

// export default function RootLayout({ children }) {
//   return (
//     <html lang="en">
//       <body className={inter.className}>
        
//         {/* PUT IT HERE! This guarantees it never unmounts, 
//             no matter which module or folder you navigate to! */}
//         <SocketProvider>
//           {children}
//         </SocketProvider>

//       </body>
//     </html>
//   );
// }




// import { Inter } from "next/font/google";
// import "./globals.css";
// import SocketProvider from "./(portal)/compo/SocketProvider"; 
// import { GlobalProvider } from "./GlobalContext"; // IMPORT PROVIDER

// const inter = Inter({ subsets: ["latin"] });

// export const metadata = {
//   title: "Kiotel",
//   description: "Kiotel tickets",
//   icons: { icon: "/favicon.ico" },
// };

// export default function RootLayout({ children }) {
//   return (
//     <html lang="en">
//       <body className={inter.className}>
//         <SocketProvider>
//           <GlobalProvider>
//             {children}
//           </GlobalProvider>
//         </SocketProvider>
//       </body>
//     </html>
//   );
// }



import { Inter, Syne, DM_Sans } from "next/font/google";
import "./globals.css";
import SocketProvider from "./(portal)/compo/SocketProvider";
import { GlobalProvider } from "./GlobalContext";

const inter = Inter({ subsets: ["latin"] });

const syne = Syne({
  subsets:  ["latin"],
  weight:   ["400", "500", "600", "700", "800"],
  variable: "--font-syne",
  display:  "swap",
});

const dmSans = DM_Sans({
  subsets:  ["latin"],
  weight:   ["300", "400", "500"],
  variable: "--font-dm-sans",
  display:  "swap",
});

export const metadata = {
  title:       "Kiotel",
  description: "Kiotel tickets",
  icons:       { icon: "/favicon.ico" },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} ${syne.variable} ${dmSans.variable}`}>
        <SocketProvider>
          <GlobalProvider>
            {children}
          </GlobalProvider>
        </SocketProvider>
      </body>
    </html>
  );
}