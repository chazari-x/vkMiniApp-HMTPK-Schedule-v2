import React, {FC, lazy} from "react";
import {Props} from "../panels/TeacherSchedule.tsx";
import Loader from "../components/Loader.tsx";

const TeacherSchedule = lazy(() => import('../panels/TeacherSchedule.tsx'));

const Lazy: FC<Props & { setPopout: (popout: React.ReactNode) => void; }> = (Props) =>
  <TeacherSchedule props={Props} onLoadStart={() => Props.setPopout(<Loader/>)} onLoad={() => Props.setPopout(null)}/>;

export default Lazy;