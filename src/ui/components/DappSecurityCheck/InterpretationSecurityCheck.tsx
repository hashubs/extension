// import React, { useMemo, useRef } from 'react';
// import { Content } from 'react-area';
// import { DelayedRender } from 'src/ui/components/DelayedRender';
// import { PortalToRootNode } from 'src/ui/components/PortalToRootNode';
// import { TransactionWarning } from 'src/ui/pages/SendTransaction/TransactionWarnings/TransactionWarning';
// import { BottomSheetDialog } from 'src/ui/ui-kit/ModalDialogs/BottomSheetDialog';
// import { DialogButtonValue } from 'src/ui/ui-kit/ModalDialogs/DialogTitle';
// import type { HTMLDialogElementInterface } from 'src/ui/ui-kit/ModalDialogs/HTMLDialogElementInterface';
// import { ZStack } from 'src/ui/ui-kit/ZStack';
// import ShieldIcon from 'jsx:src/ui/assets/shield-filled.svg';
// import WarningIcon from 'jsx:src/ui/assets/warning-triangle.svg';
// import type {
//   InterpretResponse,
//   Warning,
//   WarningSeverity,
// } from 'src/modules/zerion-api/requests/wallet-simulate-transaction';
// import { SecurityStatusButton } from './SecurityStatusButton';
// import type { SecurityButtonKind } from './SecurityStatusButton';

// const WarningSeverityPriority: Record<WarningSeverity, number> = {
//   Gray: 0,
//   Yellow: 1,
//   Orange: 2,
//   Red: 3,
// };

// function warningComparator(a: Warning, b: Warning) {
//   return (
//     (WarningSeverityPriority[b.severity] || 0) -
//     (WarningSeverityPriority[a.severity] || 0)
//   );
// }

// function sortWarnings(warnings?: Warning[]) {
//   if (!warnings) return null;
//   return warnings.sort(warningComparator);
// }

// export function hasCriticalWarning(warnings?: Warning[] | null) {
//   if (!warnings) return false;
//   const severity = sortWarnings(warnings)?.at(0)?.severity;
//   return severity === 'Red' || severity === 'Orange';
// }

// type InterpretationMode = 'loading' | 'error' | 'success';

// function InterpretationDescritionDialog({
//   mode,
// }: {
//   mode: InterpretationMode;
// }) {
//   if (mode === 'loading') {
//     return (
//       <div className="flex flex-col gap-8 p-4 pb-6 relative bg-gradient-to-br from-gray-100 to-gray-200">
//         <div className="flex flex-col gap-4 relative">
//           <span className="text-xl font-bold">Transaction Analysis</span>
//           <span className="text-sm">
//             We simulate your transaction behavior to preview the exact outcome,
//             identify risks, and protect your funds before signing and executing
//             onchain.
//           </span>
//           <span className="text-sm">
//             Security checks are powered by Blockaid.
//           </span>
//         </div>
//         <form method="dialog" onSubmit={(e) => e.stopPropagation()}>
//           <button
//             value={DialogButtonValue.cancel}
//             className="w-full py-3 rounded-2xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors"
//           >
//             Close
//           </button>
//         </form>
//       </div>
//     );
//   }

//   if (mode === 'error') {
//     return (
//       <div className="flex flex-col gap-8 p-4 pb-6 relative overflow-hidden bg-gradient-to-br from-blue-100 to-blue-200">
//         <WarningIcon className="absolute -top-12 -right-16 w-48 h-48 opacity-10 text-blue-400" />
//         <div className="flex flex-col gap-4 relative">
//           <span className="text-xl font-bold">Unverified</span>
//           <span className="text-sm">
//             We were unable to simulate the transaction or complete all security
//             checks. Please proceed with caution.
//           </span>
//           <span className="text-sm">
//             Security checks are powered by Blockaid.
//           </span>
//         </div>
//         <form method="dialog" onSubmit={(e) => e.stopPropagation()}>
//           <button
//             value={DialogButtonValue.cancel}
//             className="w-full py-3 rounded-2xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors"
//           >
//             Close
//           </button>
//         </form>
//       </div>
//     );
//   }

//   return (
//     <div className="flex flex-col gap-8 p-4 pb-6 relative overflow-hidden bg-gradient-to-br from-green-100 to-green-200">
//       <ShieldIcon className="absolute -top-24 -right-20 w-72 h-72 opacity-10 text-green-400" />
//       <div className="flex flex-col gap-4 relative">
//         <span className="text-xl font-bold">No Risks Found</span>
//         <span className="text-sm">
//           Our simulation found no security issues. However, it is always crucial
//           to double-check and proceed with caution.
//         </span>
//         <span className="text-sm">
//           Security checks are powered by Blockaid.
//         </span>
//       </div>
//       <form method="dialog" onSubmit={(e) => e.stopPropagation()}>
//         <button
//           value={DialogButtonValue.cancel}
//           className="w-full py-3 rounded-2xl bg-green-500 text-white font-semibold hover:bg-green-600 transition-colors"
//         >
//           Close
//         </button>
//       </form>
//     </div>
//   );
// }

// export function InterpretationSecurityCheck({
//   interpretQuery,
//   interpretation,
// }: {
//   interpretation: InterpretResponse | null | undefined;
//   interpretQuery: {
//     isInitialLoading: boolean;
//     isError: boolean;
//   };
// }) {
//   const loadingDialogRef = useRef<HTMLDialogElementInterface | null>(null);
//   const errorDialogRef = useRef<HTMLDialogElementInterface | null>(null);
//   const successDialogRef = useRef<HTMLDialogElementInterface | null>(null);

//   const mode: InterpretationMode = interpretQuery.isInitialLoading
//     ? 'loading'
//     : interpretQuery.isError
//     ? 'error'
//     : 'success';

//   const warnings = useMemo(
//     () => sortWarnings(interpretation?.data.warnings),
//     [interpretation]
//   );
//   const warningSeverity = warnings?.at(0)?.severity;

//   const securityButtonKind: SecurityButtonKind =
//     warningSeverity === 'Red' || warningSeverity === 'Orange'
//       ? 'danger'
//       : warningSeverity === 'Yellow'
//       ? 'warning'
//       : warningSeverity === 'Gray'
//       ? 'unknown'
//       : mode === 'loading'
//       ? 'loading'
//       : mode === 'success'
//       ? 'ok'
//       : 'unknown';

//   return (
//     <>
//       <div className="relative">
//         <SecurityStatusButton
//           kind={securityButtonKind}
//           size="small"
//           onClick={
//             mode === 'loading'
//               ? () => loadingDialogRef.current?.showModal()
//               : mode === 'error' || warningSeverity === 'Gray'
//               ? () => errorDialogRef.current?.showModal()
//               : mode === 'success' && !warningSeverity
//               ? () => successDialogRef.current?.showModal()
//               : undefined
//           }
//           title={
//             warningSeverity === 'Red' ||
//             warningSeverity === 'Orange' ||
//             warningSeverity === 'Yellow'
//               ? 'Risks Found'
//               : warningSeverity === 'Gray'
//               ? 'Unverified'
//               : mode === 'loading'
//               ? 'Simulating...'
//               : mode === 'success'
//               ? 'No Risks Found'
//               : 'Unverified'
//           }
//         />
//         {mode === 'loading' ? (
//           <ZStack
//             hideLowerElements={true}
//             style={{
//               position: 'absolute',
//               top: 'calc(100% + 8px)',
//               whiteSpace: 'nowrap',
//               textAlign: 'left',
//             }}
//           >
//             <DelayedRender delay={11000}>
//               <span className="text-black">(Going to give up soon...)</span>
//             </DelayedRender>
//             <DelayedRender delay={6000}>
//               <span className="text-black">
//                 (Request is taking longer than usual...)
//               </span>
//             </DelayedRender>
//           </ZStack>
//         ) : null}
//       </div>

//       <PortalToRootNode>
//         <BottomSheetDialog
//           ref={loadingDialogRef}
//           height="fit-content"
//           containerStyle={{ padding: 0, overflow: 'hidden' }}
//         >
//           <InterpretationDescritionDialog mode="loading" />
//         </BottomSheetDialog>
//       </PortalToRootNode>
//       <PortalToRootNode>
//         <BottomSheetDialog
//           ref={errorDialogRef}
//           height="fit-content"
//           containerStyle={{ padding: 0, overflow: 'hidden' }}
//         >
//           <InterpretationDescritionDialog mode="error" />
//         </BottomSheetDialog>
//       </PortalToRootNode>
//       <PortalToRootNode>
//         <BottomSheetDialog
//           ref={successDialogRef}
//           height="fit-content"
//           containerStyle={{ padding: 0, overflow: 'hidden' }}
//         >
//           <InterpretationDescritionDialog mode="success" />
//         </BottomSheetDialog>
//       </PortalToRootNode>

//       <Content name="transaction-warning-section">
//         {warnings?.length && warningSeverity !== 'Gray' ? (
//           <div className="flex flex-col gap-2">
//             {warnings.map((warning) => (
//               <TransactionWarning
//                 key={warning.title}
//                 title={warning.title}
//                 message={
//                   <div
//                     className="w-full overflow-hidden text-ellipsis"
//                     style={{
//                       display: '-webkit-box',
//                       WebkitLineClamp: 5,
//                       WebkitBoxOrient: 'vertical',
//                     }}
//                     title={warning.description}
//                   >
//                     {warning.description}
//                   </div>
//                 }
//                 kind={
//                   warningSeverity === 'Red' || warningSeverity === 'Orange'
//                     ? 'danger'
//                     : warningSeverity === 'Yellow'
//                     ? 'warning'
//                     : 'info'
//                 }
//               />
//             ))}
//           </div>
//         ) : mode === 'error' ? (
//           <TransactionWarning message="We were unable to simulate the transaction or complete all security checks. Please proceed with caution." />
//         ) : null}
//       </Content>
//     </>
//   );
// }
