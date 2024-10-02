import React, {FC, lazy} from "react";
import {Props} from "../panels/Announces.tsx";
import Loader from "../components/Loader.tsx";

const Announces = lazy(() => import('../panels/Announces.tsx'));

const Lazy: FC<Props & { setPopout: (popout: React.ReactNode) => void; }> = (Props) =>
  <Announces props={Props} onLoadStart={() => Props.setPopout(<Loader/>)} onLoad={() => Props.setPopout(null)}/>;

export default Lazy;