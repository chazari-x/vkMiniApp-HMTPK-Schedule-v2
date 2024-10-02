import React, {FC, HtmlHTMLAttributes, useEffect, useState} from "react";
import {SetupResizeObserver} from "../utils/utils.tsx";
import {Pagination, Panel, Separator} from "@vkontakte/vkui";
import {Announce as AnnounceType} from "../types.ts";
import {GetAnnounces} from "../api/api.ts";
import Loader from "../components/Loader.tsx";
import {useActiveVkuiLocation, useRouteNavigator, useSearchParams} from "@vkontakte/vk-mini-apps-router";
import {Announce, AnnounceSkeleton} from "../components/Announce.tsx";
import NewAlert from "../components/Alert.tsx";

export interface Props {
  id: string;
  popout: React.ReactNode;
  setPopout: (popout: React.ReactNode) => void;
  panelHeader: React.ReactNode;
}

const Announces: FC<{ props: Props; } & HtmlHTMLAttributes<HTMLDivElement>> = ({props}) => {
  const {id, popout, setPopout, panelHeader} = props;

  useEffect(() => SetupResizeObserver("announce_resize"), []);

  const routeNavigator = useRouteNavigator();
  const [params,] = useSearchParams();
  const {panel} = useActiveVkuiLocation();
  const [page, setPage] = useState<number | undefined>();
  useEffect(() => {
    if (panel !== id) return;

    if (!params.get('page')) {
      routeNavigator.replace(`/${id}?page=1`);
      return;
    }

    const page = parseInt(params.get('page')!)
    if (isNaN(page)) {
      routeNavigator.replace(`/${id}?page=1`);
      return;
    }

    setPage(page);
  }, [params, panel]);

  const [lastPage, setLastPage] = useState<number | undefined>();
  const [announces, setAnnounces] = useState<AnnounceType[] | undefined>();
  const [error, setError] = useState<string | undefined>();
  useEffect(() => {
    if (!page) return
    setAnnounces(undefined)
    setPopout(<Loader/>)
    GetAnnounces(page)
      .then((announces) => {
        setAnnounces(announces.announces)
        setLastPage(announces.last_page)
      })
      .catch((e) => {
        console.error(e)
        setError(e)
      })
      .finally(() => setPopout(null))
  }, [page]);

  const changePage = (page: number) => {
    routeNavigator.push(`/${id}?page=${page}`)
  };

  return <Panel id={id}>
    {panelHeader}
    <div id="announce_resize">
      {popout == null
        ? announces ? announces.map((announce, index) => <>
          <Announce announce={announce}/>
          {index != announces?.length - 1 && <Separator/>}
        </>) : error != ""
          ? <NewAlert children="Страница сломана на сайте колледжа" severity="warning"/>
          : error != undefined && <NewAlert children={error} severity="error"/>
        : [1, 2].map((key, index) => <>
          <AnnounceSkeleton key={key}/>
          {index != 1 && <Separator/>}
        </>)}
      {page != undefined && <div className="announce_pagination">
        <Pagination
          navigationButtonsStyle="icon"
          currentPage={page}
          boundaryCount={1}
          totalPages={lastPage ?? 69}
          disabled={popout != null}
          onChange={changePage}
        />
      </div>}
    </div>
  </Panel>;
};

export default Announces;