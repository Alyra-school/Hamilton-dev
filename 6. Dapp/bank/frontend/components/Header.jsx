import { ConnectButton } from "@rainbow-me/rainbowkit"

const Header = () => {
  return (
    <div className="flex justify-between items-center w-full p-5">
        <div>Logo</div>
        <ConnectButton />
    </div>
  )
}

export default Header