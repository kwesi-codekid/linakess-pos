/* eslint-disable @typescript-eslint/no-explicit-any */
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

const EditModal: React.FC<Props> = ({
  openModal,
  setOpenModal,
  title,
  children,
  formType,
}) => {
  const submit = useSubmit();
  return (
    <Modal
      title={title}
      open={openModal}
      onCancel={() => setOpenModal(false)}
      onOk={() => {
        formType
          .validateFields()
          .then((values: any) => {
            submit({ ...values, actionType: "edit" }, { method: "POST" });
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
        className: "!text-white !bg-blue-600 hover:!bg-blue-500 font-sen",
      }}
    >
      <Form form={formType} layout="vertical" requiredMark={false}>
        {children}
      </Form>
    </Modal>
  );
};

export default EditModal;
