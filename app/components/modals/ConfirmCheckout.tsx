/* eslint-disable react/prop-types */
import { Modal } from "antd";

interface Props {
  openModal: boolean;
  setOpenModal: (value: boolean) => void;
  title: string;
  children: React.ReactNode;
  handleCheckout: () => void;
}

const ConfirmCheckout: React.FC<Props> = ({
  openModal,
  setOpenModal,
  title,
  children,
  handleCheckout,
}) => {
  return (
    <Modal
      open={openModal}
      onCancel={() => setOpenModal(false)}
      title={title}
      className="!w-1/2"
      onOk={() => {
        handleCheckout();
      }}
      okButtonProps={{
        className: "!text-white !bg-blue-600 hover:!bg-blue-500 font-sen",
      }}
    >
      {children}
    </Modal>
  );
};

export default ConfirmCheckout;
