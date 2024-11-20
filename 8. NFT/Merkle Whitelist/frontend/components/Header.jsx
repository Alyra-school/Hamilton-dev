import { ConnectButton } from '@rainbow-me/rainbowkit';

const Header = () => {
  return (
    <div className="flex justify-between items-center p-5">
        <p>Logo</p>
        <ConnectButton />
    </div>
  )
}

export default Header