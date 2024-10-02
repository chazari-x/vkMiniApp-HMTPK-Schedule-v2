import React, {FC, lazy} from "react";
import {Props} from "../panels/Settings.tsx";
import Loader from "../components/Loader.tsx";

const Settings = lazy(() => import('../panels/Settings.tsx'));

const Lazy: FC<Props & { setPopout: (popout: React.ReactNode) => void; }> = (Props) =>
  <Settings props={Props} onLoadStart={() => Props.setPopout(<Loader/>)} onLoad={() => Props.setPopout(null)}/>;

export default Lazy;