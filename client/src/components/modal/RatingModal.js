import React, { useState } from "react";
import { useSelector } from "react-redux";
import { Modal } from "antd";
import { toast } from "react-toastify";
import { StarOutlined } from "@ant-design/icons";
import { useHistory, useParams } from "react-router-dom";

const RatingModal = ({ children }) => {
    const { user } = useSelector((state) => ({ ...state }));
    const [modalVisible, setModalVisible] = useState(false);

    let history = useHistory();
    let { slug } = useParams();

    const handleModal = () => {
        if (user && user.token) {
            setModalVisible(true);
        } else {
            history.push({
                pathname: "/login",
                state: { from: `/product/${slug}` },
            });
        }
    };

    return (
        <>
            <div onClick={handleModal}>
                <StarOutlined className="text-danger" /> <br />
                {user ? "Leave rating" : "Login to leave rating"}
            </div>

            <Modal
                title="Leave tour rating"
                centered
                visible={modalVisible}
                onOk={() => {
                    setModalVisible(false);
                    toast.success(
                        "Thanks for your review. It will appear soon."
                    );
                }}
                onCancel={() => setModalVisible(false)}
            >
                {children}
            </Modal>
        </>
    );
};

export default RatingModal;
