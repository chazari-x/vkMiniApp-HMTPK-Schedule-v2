import React, {FC, lazy} from "react";
import {Props} from "../panels/Abitur.tsx";
import Loader from "../components/Loader.tsx";

const Abitur = lazy(() => import('../panels/Abitur.tsx'));

const Lazy: FC<Props & { setPopout: (popout: React.ReactNode) => void; }> = (Props) =>
  <Abitur props={Props} onLoadStart={() => Props.setPopout(<Loader/>)} onLoad={() => Props.setPopout(null)}/>;

export default Lazy;