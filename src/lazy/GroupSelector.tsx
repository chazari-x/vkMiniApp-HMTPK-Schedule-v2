import React, {FC, lazy} from "react";
import {Props} from "../panels/GroupSelector.tsx";
import Loader from "../components/Loader.tsx";

const GroupSelector = lazy(() => import('../panels/GroupSelector.tsx'));

const Lazy: FC<Props & { setPopout: (popout: React.ReactNode) => void; }> = (Props) =>
  <GroupSelector props={Props} onLoadStart={() => Props.setPopout(<Loader/>)} onLoad={() => Props.setPopout(null)}/>;

export default Lazy;