import {FC} from "react";
import Lottie from "lottie-react";
import loading from "../assets/loading.json";

const Loader: FC = () => <div style={{
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: '100vh',
  backgroundColor: 'rgba(25,39,75,0.5)',
  zIndex: 99999999,
}}>
  <Lottie animationData={loading} style={{
    position: 'absolute',
    width: '96px'
  }} />
</div>

export default Loader;