import React, {FC, lazy} from "react";
import {Props} from "../panels/College.tsx";
import Loader from "../components/Loader.tsx";

const College = lazy(() => import('../panels/College.tsx'));

const Lazy: FC<Props & { setPopout: (popout: React.ReactNode) => void; }> = (Props) =>
  <College props={Props} onLoadStart={() => Props.setPopout(<Loader/>)} onLoad={() => Props.setPopout(null)}/>;

export default Lazy;