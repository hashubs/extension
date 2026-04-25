import { apostrophe } from '@/shared/typography';
import { Layout } from '@/ui/components/layout';
import { useNavigate } from 'react-router-dom';

export function RpcUrlHelp() {
  const navigate = useNavigate();
  return (
    <Layout
      title="RPC URLs"
      onBack={() => navigate(-1)}
      classNameWrapper="flex flex-col gap-2"
    >
      <p className="text-xs text-muted-foreground">
        It{apostrophe}s your choice to update the RPC URL or not. You can always
        switch back to the default RPC URL in your network settings if you
        prefer.
      </p>
      <h3 className="text-sm font-medium">What is RPC URL?</h3>
      <p className="text-xs text-muted-foreground">
        RPC stands for Remote Procedure Call. In the context of a Web3 wallet,
        it{apostrophe}s a method that allows your wallet to interact and
        communicate with blockchain networks. RPC URL is an 'address' that your
        wallet uses to talk to the specific network.
      </p>
      <h3 className="text-sm font-medium">Why Update Your RPC URL?</h3>
      <p className="text-xs text-muted-foreground">
        As networks evolve and improve, new RPC URLs may be released.
      </p>
      <h3 className="text-sm font-medium">Potential Risks</h3>
      <p className="text-xs text-muted-foreground">
        While updating the RPC URL is generally safe, it{apostrophe}s crucial to
        ensure that the new URL from a trusted source. Using an incorrect or
        untrusted RPC URL can lead to performance issues and might even expose
        your wallet to security risks.
      </p>
    </Layout>
  );
}
