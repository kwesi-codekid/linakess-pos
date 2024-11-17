/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/prop-types */
import { Modal, Form, message } from "antd";
import { useSubmit } from "@remix-run/react";

interface Props {
  openModal: boolean;
  setOpenModal: (value: boolean) => void;
  title: string;
  children: React.ReactNode;
  formType: any;
  additionalData?: any;
}

const CreateModal: React.FC<Props> = ({
  openModal = false,
  setOpenModal,
  title,
  children,
  formType,
  additionalData,
}) => {
  const submit = useSubmit();

  return (
    <Modal
      title={<h2>{title}</h2>}
      open={openModal}
      onCancel={() => setOpenModal(false)}
      onOk={async () => {
        try {
          const values = await formType.validateFields();
          await submit(
            { ...values, additionalData: JSON.stringify(additionalData) },
            { method: "post" }
          );

          message.success("Record is saved successfully");
          setOpenModal(false);
        } catch (error: any) {
          message.error(error.message);
        } finally {
          formType.resetFields();
        }
      }}
      okButtonProps={{
        className: "!text-white !bg-blue-600 hover:!bg-blue-500 font-sen",
      }}
    >
      <Form requiredMark={false} layout="vertical" form={formType}>
        {children}
      </Form>
    </Modal>
  );
};

export default CreateModal;
