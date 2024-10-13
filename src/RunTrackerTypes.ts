export interface RunData {
    distance: number;
    time: number;
    pace: number;
  }
  
  export interface RunTrackerProps {
    onDataUpdate: (data: RunData) => void;
    customStyles?: {
      container?: string;
      title?: string;
      dataContainer?: string;
      dataItem?: string;
      buttonContainer?: string;
      button?: string;
    };
  }
  