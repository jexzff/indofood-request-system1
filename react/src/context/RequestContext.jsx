import { createContext, useContext, useState } from 'react';
import { lines as initialLines, requestDetail as initialRequestDetail } from '../data/dummyData';

const RequestContext = createContext();

export const RequestProvider = ({ children }) => {
  const [lines, setLines] = useState(initialLines);
  const [requestDetail, setRequestDetail] = useState(initialRequestDetail);
  const [history, setHistory] = useState([]);

  const confirmRequest = (lineId, requestId, actValue) => {
    const updatedDetail = { ...requestDetail };

    updatedDetail[lineId] = updatedDetail[lineId].map((item) => {
      if (item.id === requestId) {
        return {
          ...item,
          act: actValue,
          status: 'confirm',
          confirmTime: new Date().toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit',
          }),
        };
      }
      return item;
    });

    setRequestDetail(updatedDetail);

    const allConfirm = updatedDetail[lineId].every(
      (item) => item.status === 'confirm'
    );

    if (allConfirm) {
      setLines((prev) =>
        prev.map((line) =>
          line.id === Number(lineId)
            ? { ...line, status: 'confirm' }
            : line
        )
      );
    }

    const confirmedItem = updatedDetail[lineId].find(
      (item) => item.id === requestId
    );

    setHistory((prev) => [
      {
        line: lineId,
        flavour: confirmedItem.flavour,
        rqs: confirmedItem.rqs,
        act: confirmedItem.act,
        shift: confirmedItem.shift,
        requestTime: confirmedItem.time,
        confirmTime: confirmedItem.confirmTime,
      },
      ...prev,
    ]);
  };

  return (
    <RequestContext.Provider
      value={{
        lines,
        requestDetail,
        history,
        confirmRequest,
      }}
    >
      {children}
    </RequestContext.Provider>
  );
};

export const useRequest = () => useContext(RequestContext);