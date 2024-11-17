/* eslint-disable react/prop-types */
import { Modal } from "antd";

interface Props {
  openModal: boolean;
  setOpenModal: (value: boolean) => void;
  title: string;
  text: string;
  handleOk: () => void;
}

const ConfirmModal: React.FC<Props> = ({
  openModal,
  setOpenModal,
  title,
  text,
  handleOk,
}) => {
  return (
    <Modal
      title={title}
      open={openModal}
      onOk={handleOk}
      onCancel={() => setOpenModal(false)}
      okButtonProps={{
        className: "!text-white !bg-blue-600 hover:!bg-blue-500 font-sen",
      }}
    >
      <p className="text-lg font-sen text-slate-800">{text}</p>
    </Modal>
  );
};

export default ConfirmModal;
