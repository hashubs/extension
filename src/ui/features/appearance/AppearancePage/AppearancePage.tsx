// import { useStore } from '@store-unit/react';
// import React from 'react';
// import { PageBottom } from '@/ui/components/PageBottom';
// import { PageColumn } from '@/ui/components/PageColumn';
// import { PageTop } from '@/ui/components/PageTop';
// import { UIText } from '@/ui/ui-kit/UIText';
// import { useBackgroundKind } from '@/ui/components/Background';
// import { Frame } from '@/ui/ui-kit/Frame';
// import { FrameListItemButton } from '@/ui/ui-kit/FrameList';
// import CheckIcon from 'jsx:@/ui/assets/check.svg';
// import { HStack } from '@/ui/ui-kit/HStack';
// import { VStack } from '@/ui/ui-kit/VStack';
// import { ThemePreference, preferenceStore } from '../preference-store';

// const preferenceStrings = {
//   [ThemePreference.light]: 'Always Light',
//   [ThemePreference.dark]: 'Always Dark',
//   [ThemePreference.system]: 'System',
// };

// const THEMES: ThemePreference[] = [
//   ThemePreference.light,
//   ThemePreference.system,
//   ThemePreference.dark,
// ];

// export function AppearancePage() {
//   const { mode } = useStore(preferenceStore);
//   useBackgroundKind({ kind: 'white' });

//   return (
//     <PageColumn>
//       <PageTop />
//       <Frame>
//         <VStack gap={0}>
//           {THEMES.map((preference) => (
//             <FrameListItemButton
//               key={preference}
//               onClick={() => {
//                 preferenceStore.setState((current) => ({
//                   ...current,
//                   mode: preference,
//                 }));
//               }}
//             >
//               <HStack
//                 gap={8}
//                 alignItems="center"
//                 justifyContent="space-between"
//               >
//                 <UIText kind="body/accent">
//                   {preferenceStrings[preference]}
//                 </UIText>
//                 {mode === preference ? (
//                   <CheckIcon style={{ width: 24, height: 24 }} />
//                 ) : null}
//               </HStack>
//             </FrameListItemButton>
//           ))}
//         </VStack>
//       </Frame>
//       <PageBottom />
//     </PageColumn>
//   );
// }
