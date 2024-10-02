import React, {FC, lazy} from "react";
import {Props} from "../panels/MySchedule.tsx";
import Loader from "../components/Loader.tsx";

const MySchedule = lazy(() => import('../panels/MySchedule.tsx'));

const Lazy: FC<Props & { setPopout: (popout: React.ReactNode) => void; }> = (Props) =>
  <MySchedule props={Props} onLoadStart={() => Props.setPopout(<Loader/>)} onLoad={() => Props.setPopout(null)}/>;

export default Lazy;