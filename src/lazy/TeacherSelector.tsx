import React, {FC, lazy} from "react";
import {Props} from "../panels/TeacherSelector.tsx";
import Loader from "../components/Loader.tsx";

const TeacherSelector = lazy(() => import('../panels/TeacherSelector.tsx'));

const Lazy: FC<Props & { setPopout: (popout: React.ReactNode) => void; }> = (Props) =>
  <TeacherSelector props={Props} onLoadStart={() => Props.setPopout(<Loader/>)} onLoad={() => Props.setPopout(null)}/>;

export default Lazy;