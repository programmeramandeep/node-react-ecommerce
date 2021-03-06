import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    applyCoupon,
    emptyUserCart,
    getUserCart,
    saveUserAddress,
    createCashOrderForUser,
} from "../functions/user";
import { toast } from "react-toastify";
import { Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

const Checkout = ({ history }) => {
    const [products, setProducts] = useState([]);
    const [total, setTotal] = useState(0);
    const [address, setAddress] = useState();
    const [addressSaved, setAddressSaved] = useState(false);
    const [coupon, setCoupon] = useState("");
    const [totalAfterDiscount, setTotalAfterDiscount] = useState(0);
    const [discountError, setDiscountError] = useState("");
    const [loading, setLoading] = useState(false);

    const dispatch = useDispatch();
    const { user, cod } = useSelector((state) => ({ ...state }));
    const couponTruOrFalse = useSelector((state) => state.coupon);

    useEffect(() => {
        getUserCart(user.token).then((res) => {
            setProducts(res.data.products);
            setTotal(res.data.cartTotal);
        });

        return () => setProducts([]);
    }, [user.token]);

    const saveAddressToDb = () => {
        saveUserAddress(user.token, address).then((res) => {
            if (res.data.ok) {
                setAddressSaved(true);
                toast.success("Address saved successfully.");
            }
        });
    };

    const emptyCart = () => {
        // remove from local storage
        if (typeof window !== "undefined") {
            localStorage.removeItem("cart");
        }
        // remove from redux
        dispatch({
            type: "ADD_TO_CART",
            payload: [],
        });
        // remove from backend
        emptyUserCart(user.token).then((res) => {
            setProducts([]);
            setTotal(0);
            setTotalAfterDiscount(0);
            toast.success("Cart is empty. Contniue shopping.");
        });
    };

    const showAddress = () => (
        <>
            <textarea
                name="address"
                id="address"
                cols="30"
                rows="4"
                className="form-control"
                placeholder="Enter your address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
            ></textarea>
            <button
                className="btn btn-primary btn-info btn-raised mt-2"
                onClick={saveAddressToDb}
                disabled={address && !address.length}
            >
                Save
            </button>
        </>
    );

    const showProductSummary = () =>
        products.map((p, i) => (
            <div key={i}>
                <p>
                    {p.product.title} ({p.color}) x {p.count} ={" "}
                    <strong>{p.product.price * p.count}</strong>
                </p>
            </div>
        ));

    const applyDiscountCoupon = () => {
        applyCoupon(user.token, coupon).then((res) => {
            if (res.data) {
                setTotalAfterDiscount(res.data);
                // update redux coupon applied true / false
                dispatch({
                    type: "COUPON_APPLIED",
                    payload: true,
                });
            }

            if (res.data.err) {
                setDiscountError(res.data.err);
                toast.error(res.data.err);
                // update redux coupon applied true / false
                dispatch({
                    type: "COUPON_APPLIED",
                    payload: false,
                });
            }
        });
    };

    const showApplyCoupon = () => (
        <>
            <input
                type="text"
                name="coupon"
                id="coupon"
                onChange={(e) => {
                    setCoupon(e.target.value);
                    setDiscountError("");
                }}
                value={coupon}
                className="form-control"
            />

            <button
                onClick={applyDiscountCoupon}
                className="btn btn-warning btn-raised mt-2"
            >
                Apply
            </button>
        </>
    );

    const createCashOrder = () => {
        setLoading(true);
        createCashOrderForUser(user.token, cod, couponTruOrFalse).then(
            (res) => {
                setLoading(false);
                if (res.data.ok) {
                    toast.success("Order placed successfully");
                    // empty cart from local storage
                    if (typeof window !== "undefined") {
                        localStorage.removeItem("cart");
                    }
                    // emprt cart from redux
                    dispatch({
                        type: "ADD_TO_CART",
                        payload: [],
                    });
                    // reset coupon to false
                    dispatch({
                        type: "COUPON_APPLIED",
                        payload: false,
                    });
                    // reset cod to false
                    dispatch({
                        type: "CASH_ON_DELIVERY",
                        payload: false,
                    });
                    // empty cart from database
                    emptyUserCart(user.token);
                    // redirect
                    setTimeout(() => {
                        history.push("/user/history");
                    }, 1500);
                }
            }
        );
    };

    return (
        <div className="container-fluid py-3">
            <div className="row">
                <div className="col-md-6">
                    <h4>Delivery Address</h4>
                    {showAddress()}

                    <h4 className="mt-4">Got Coupon?</h4>
                    {showApplyCoupon()}

                    {discountError && (
                        <div className="alert alert-danger">
                            {discountError}
                        </div>
                    )}
                </div>
                <div className="col-md-6">
                    <h4>Order Summary</h4>
                    <hr />
                    <p>{products.length} Product(s) in cart</p>
                    <hr />
                    {showProductSummary()}
                    <hr />
                    <h5>Cart total: ${total}</h5>

                    {totalAfterDiscount > 0 && (
                        <div className="alert alert-success lead">
                            Discount Applied: Total Payable: $
                            {totalAfterDiscount}
                        </div>
                    )}

                    <div className="row">
                        <div className="col-md-6">
                            {cod ? (
                                <button
                                    className="btn btn-primary btn-raised"
                                    disabled={
                                        !addressSaved ||
                                        !products.length ||
                                        loading
                                    }
                                    onClick={createCashOrder}
                                >
                                    {loading ? (
                                        <>
                                            <Spin
                                                indicator={<LoadingOutlined />}
                                                className="mr-2 text-white"
                                            />
                                            ...Loading
                                        </>
                                    ) : (
                                        "Place Order"
                                    )}
                                </button>
                            ) : (
                                <button
                                    className="btn btn-primary btn-raised"
                                    disabled={!addressSaved || !products.length}
                                    onClick={() => history.push("/payment")}
                                >
                                    Place Order
                                </button>
                            )}
                        </div>

                        <div className="col-md-6">
                            <button
                                className="btn btn-danger btn-raised"
                                disabled={!products.length}
                                onClick={emptyCart}
                            >
                                Empty Cart
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
