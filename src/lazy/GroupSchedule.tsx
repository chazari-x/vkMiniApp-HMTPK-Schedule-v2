import React, {FC, lazy} from "react";
import {Props} from "../panels/GroupSchedule.tsx";
import Loader from "../components/Loader.tsx";

const GroupSchedule = lazy(() => import('../panels/GroupSchedule.tsx'));

const Lazy: FC<Props & { setPopout: (popout: React.ReactNode) => void; }> = (Props) =>
  <GroupSchedule props={Props} onLoadStart={() => Props.setPopout(<Loader/>)} onLoad={() => Props.setPopout(null)}/>;

export default Lazy;