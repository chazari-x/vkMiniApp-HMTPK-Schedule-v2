import React, {FC, lazy} from "react";
import {Props} from "../panels/Information.tsx";
import Loader from "../components/Loader.tsx";

const Information = lazy(() => import('../panels/Information.tsx'));

const Lazy: FC<Props & { setPopout: (popout: React.ReactNode) => void }> = (Props) =>
  <Information props={Props} onLoadStart={() => Props.setPopout(<Loader/>)} onLoad={() => Props.setPopout(null)}/>

export default Lazy;