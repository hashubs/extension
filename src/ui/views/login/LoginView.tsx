// import { accountPublicRPCPort, walletPort } from '@/shared/channel';
// import { invariant } from '@/shared/invariant';
// import { PublicUser } from '@/shared/types/User';
// import { zeroizeAfterSubmission } from '@/shared/zeroize-submission';
// import { useMutation, useQuery } from '@tanstack/react-query';
// import { useCallback, useId } from 'react';
// import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';

// interface LoginViewProps {
//   onAuthenticated: () => void;
// }

// export function LoginView({ onAuthenticated }: LoginViewProps) {
//   const [params] = useSearchParams();
//   const navigate = useNavigate();

//   const {
//     data: user,
//     isLoading,
//     isError,
//     error,
//   } = useQuery({
//     queryKey: ['account/getExistingUser'],
//     queryFn: () => {
//       return accountPublicRPCPort.request('getExistingUser');
//     },
//   });

//   const formId = useId();
//   const inputId = useId();

//   const userId = user?.id;

//   const { data: lastUsedAddress } = useQuery({
//     enabled: Boolean(userId),
//     queryKey: ['wallet/getLastUsedAddress', userId],
//     queryFn: async () => {
//       invariant(userId, "user['id'] is required");
//       return walletPort.request('getLastUsedAddress', { userId });
//     },
//   });

//   const handleSuccess = useCallback(() => {
//     // Youno specific: also call the callback to refresh App state
//     onAuthenticated();

//     navigate(params.get('next') || '/', {
//       replace: true,
//     });
//   }, [navigate, params, onAuthenticated]);

//   const loginMutation = useMutation({
//     mutationFn: async ({
//       user,
//       password,
//     }: {
//       user: PublicUser;
//       password: string;
//     }) => {
//       return accountPublicRPCPort.request('login', { user, password });
//     },
//     onSuccess: async () => {
//       zeroizeAfterSubmission();
//       // There's a rare weird bug when logging in reloads login page instead of redirecting to overview.
//       await new Promise((r) => setTimeout(r, 100));
//       handleSuccess();
//     },
//   });

//   if (isLoading) return null;
//   if (isError) throw error;
//   if (!user) return <Navigate to="/" replace={true} />;

//   return (
//     <div className="login-container w-full h-full p-8 flex flex-col items-center justify-center min-h-[400px] bg-white dark:bg-gray-900 transition-colors animate-fade-in">
//       <div className="logo-section mb-12 flex flex-col items-center space-y-4">
//         <div className="w-16 h-16 bg-blue-600 rounded-2xl shadow-lg shadow-blue-200 dark:shadow-none flex items-center justify-center transform rotate-6 scale-110">
//           <span className="text-3xl font-black text-white -rotate-6">Y</span>
//         </div>
//         <div className="text-center mt-4">
//           <h1 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white">
//             Welcome Back!
//           </h1>
//           <p className="text-xs font-medium text-gray-400 dark:text-gray-500">
//             {lastUsedAddress
//               ? `Unlocking ${lastUsedAddress.slice(
//                   0,
//                   6
//                 )}...${lastUsedAddress.slice(-4)}`
//               : 'Enter password to unlock your wallet'}
//           </p>
//         </div>
//       </div>

//       <form
//         id={formId}
//         onSubmit={(event) => {
//           event.preventDefault();
//           const password = new FormData(event.currentTarget).get(
//             'password'
//           ) as string;
//           if (!password || !user) return;
//           loginMutation.mutate({ user, password });
//         }}
//         className="w-full space-y-6"
//       >
//         <div className="space-y-4">
//           <div className="relative group">
//             <input
//               id={inputId}
//               autoFocus
//               type="password"
//               name="password"
//               placeholder="Password"
//               required
//               className="w-full p-4 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent outline-none transition-all dark:text-white dark:placeholder:text-gray-600"
//             />
//           </div>

//           {!!loginMutation.error && (
//             <p className="text-xs text-center text-red-500 bg-red-50 dark:bg-red-900/20 p-3 rounded-xl border border-red-100 dark:border-red-900/30 animate-shake">
//               {(loginMutation.error as Error).message || 'Incorrect password'}
//             </p>
//           )}

//           <button
//             type="submit"
//             form={formId}
//             disabled={loginMutation.isLoading}
//             className="w-full py-4 px-6 bg-gray-900 dark:bg-blue-600 text-white rounded-2xl font-bold hover:bg-black dark:hover:bg-blue-700 transition-all shadow-xl dark:shadow-blue-900/20 active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2"
//           >
//             {loginMutation.isLoading ? (
//               <>
//                 <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
//                 Unlocking...
//               </>
//             ) : (
//               'Unlock Wallet'
//             )}
//           </button>
//         </div>
//       </form>

//       <div className="mt-12 text-center text-[10px] font-bold text-gray-400 dark:text-gray-600 uppercase tracking-widest hover:text-red-500 dark:hover:text-red-400 transition-colors cursor-pointer">
//         Forgot Password?
//       </div>
//     </div>
//   );
// }
