/* eslint-disable react/prop-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { Modal, Form } from "antd";
import { useSubmit } from "@remix-run/react";

interface Props {
  openModal: boolean;
  setOpenModal: (value: boolean) => void;
  title: string;
  children: React.ReactNode;
  formType: any;
  additionalData?: any;
}

const RepaymentModal: React.FC<Props> = ({
  openModal,
  setOpenModal,
  title,
  children,
  formType,
}) => {
  const [loading, setLoading] = useState(false);
  const submit = useSubmit();

  return (
    <Modal
      title={
        <h2 className="font-sen font-bold text-slate-800 text-lg">{title}</h2>
      }
      open={openModal}
      onCancel={() => setOpenModal(false)}
      okButtonProps={{
        className:
          "!bg-blue-500 rounded-lg font-sen hover:!bg-blue-600 !text-white font-bold",
      }}
      okText="Save"
      onOk={() => {
        formType
          .validateFields()
          .then((values: any) => {
            submit({ ...values, actionType: "repayment" }, { method: "POST" });
          })
          .catch((info: string) => {
            console.log("Validate Failed:", info);
          })
          .finally(() => {
            setOpenModal(false);
            formType.resetFields();
          });
      }}
      confirmLoading={loading}
    >
      <Form requiredMark={false} layout="vertical" form={formType}>
        {children}
      </Form>
    </Modal>
  );
};

export default RepaymentModal;
