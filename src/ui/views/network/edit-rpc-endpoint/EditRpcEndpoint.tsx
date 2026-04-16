// import { INTERNAL_ORIGIN } from '@/background/constants';
// import { createChain } from '@/modules/networks/chain';
// import { toAddEthereumChainParameter } from '@/modules/networks/helpers';
// import { walletPort } from '@/shared/channel';
// import { Header } from '@/ui/components/header';
// import { useNetworks } from '@/ui/hooks/request/internal/useNetworks';
// import { Button } from '@/ui/ui-kit';
// import { Card } from '@/ui/ui-kit/card';
// import { useMutation } from '@tanstack/react-query';
// import { useState } from 'react';
// import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
// import { IoTrashOutline } from 'react-icons/io5';
// import { FormField } from '../_shared/FormField';
// import { updateNetworks } from '../_shared/updateNetworks';

// export function EditRpcEndpoint() {
//   const { id: chainStr } = useParams();
//   const [searchParams] = useSearchParams();
//   const originalUrl = searchParams.get('url');

//   const navigate = useNavigate();
//   const [url, setUrl] = useState(originalUrl || '');
//   const [error, setError] = useState('');

//   const { networks } = useNetworks();
//   const network = networks?.getNetworkByName(createChain(chainStr!));
//   const isActive = (network as any)?.rpc_url === originalUrl;

//   const saveMutation = useMutation({
//     mutationFn: async (newUrl: string) => {
//       const config = toAddEthereumChainParameter(network!);
//       await walletPort.request('addEthereumChain', {
//         values: [
//           {
//             ...config,
//             rpcUrls: config.rpcUrls.map((u) => (u === originalUrl ? newUrl : u)),
//           },
//         ],
//         origin: INTERNAL_ORIGIN,
//         chain: chainStr ?? null,
//         prevChain: chainStr ?? null,
//       });
//       await updateNetworks();
//     },
//     onSuccess: () => navigate(-1),
//     onError: (err: any) => setError(err.message),
//   });

//   const deleteMutation = useMutation({
//     mutationFn: async () => {
//       const config = toAddEthereumChainParameter(network!);
//       await walletPort.request('addEthereumChain', {
//         values: [
//           {
//             ...config,
//             rpcUrls: config.rpcUrls.filter((u) => u !== originalUrl),
//           },
//         ],
//         origin: INTERNAL_ORIGIN,
//         chain: chainStr ?? null,
//         prevChain: chainStr ?? null,
//       });
//       await updateNetworks();
//     },
//     onSuccess: () => navigate(-1),
//   });

//   return (
//     <div className="flex flex-col h-full bg-background">
//       <Header
//         title="Edit RPC Endpoint"
//         onBack={() => navigate(-1)}
//         right={
//           !isActive && (
//             <Button
//               variant="ghost"
//               size="icon"
//               onClick={() => deleteMutation.mutate()}
//               className="text-destructive"
//             >
//               <IoTrashOutline size={20} />
//             </Button>
//           )
//         }
//       />
//       <div className="p-4 space-y-6">
//         <Card>
//           <FormField
//             label="RPC URL"
//             wrapperClassName="p-3"
//             placeholder="https://..."
//             value={url}
//             onChange={(e: any) => setUrl(e.target.value)}
//             error={error}
//             autoFocus
//           />
//         </Card>
//         {isActive && (
//           <p className="text-xs text-green-500/80 px-1 font-medium italic">
//             Active RPC cannot be deleted.
//           </p>
//         )}
//         <Button
//           onClick={() => saveMutation.mutate(url)}
//           disabled={!url || url === originalUrl || saveMutation.isPending}
//           size="lg"
//           className="w-full rounded-2xl h-12 uppercase text-xs font-bold tracking-widest mt-2"
//         >
//           {saveMutation.isPending ? 'Saving...' : 'Save Changes'}
//         </Button>
//       </div>
//     </div>
//   );
// }
