/* eslint-disable react/prop-types */
import { useSubmit } from "@remix-run/react";
import { Modal, Form } from "antd";

interface Props {
  openModal: boolean;
  setOpenModal: (value: boolean) => void;
  title: string;
  children: React.ReactNode;
  formType: any;
}

const DeleteModal: React.FC<Props> = ({
  openModal,
  setOpenModal,
  title,
  children,
  formType,
}) => {
  const submit = useSubmit();
  return (
    <Modal
      centered
      title={title}
      open={openModal}
      onCancel={() => setOpenModal(false)}
      onOk={() => {
        formType
          .validateFields()
          .then((values: object) => {
            submit({ ...values, actionType: "delete" }, { method: "POST" });
          })
          .catch((info: string) => {
            console.log("Validate Failed:", info);
          })
          .finally(() => {
            setOpenModal(false);
            formType.resetFields();
          });
      }}
      okButtonProps={{
        className: "!text-white !bg-red-500 hover:!bg-red-600 font-sen",
      }}
    >
      <Form form={formType} layout="vertical" requiredMark={false}>
        {children}
      </Form>
    </Modal>
  );
};

export default DeleteModal;
