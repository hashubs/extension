import type { ChannelContext, PrivateChannelContext } from '@/shared/types/channel-context';

export type PortContext = Partial<ChannelContext> | PrivateChannelContext;
