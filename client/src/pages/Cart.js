import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import ProductCardInCheckout from "../components/cards/ProductCardInCheckout";

const Cart = () => {
    const { user, cart } = useSelector((state) => ({ ...state }));

    const getTotal = () => {
        return cart.reduce((currentValue, nextValue) => {
            return currentValue + nextValue.count * nextValue.price;
        }, 0);
    };

    const saveOrderToDb = () => {
        //
    };

    const showCartItems = () => (
        <table className="table table-bordered">
            <thead className="thead-light">
                <tr>
                    <th scope="col">Image</th>
                    <th scope="col">Title</th>
                    <th scope="col">Price</th>
                    <th scope="col">Brand</th>
                    <th scope="col">Color</th>
                    <th scope="col">Count</th>
                    <th scope="col">Shipping</th>
                    <th scope="col">Remove</th>
                </tr>
            </thead>
            {cart.map((p) => (
                <ProductCardInCheckout key={p._id} product={p} />
            ))}
        </table>
    );

    return (
        <div className="container-fluid py-3">
            <div className="row">
                <div className="col-md-8">
                    <h4>Cart / {cart.length} Product(s)</h4>
                    {!cart.length ? (
                        <p className="lead">
                            No products in cart.{" "}
                            <Link to="/shop">Continue Shopping</Link>{" "}
                        </p>
                    ) : (
                        showCartItems()
                    )}
                </div>
                <div className="col-md-4">
                    <h4>Order Summary</h4>
                    <hr />
                    <p>Products</p>
                    {cart.map((c, i) => (
                        <div key={i}>
                            <p>
                                {c.title} x {c.count} = ${c.price * c.count}
                            </p>
                        </div>
                    ))}
                    <hr />
                    Total : <strong>${getTotal()}</strong>
                    <hr />
                    {user ? (
                        <button
                            onClick={saveOrderToDb}
                            className="btn btn-sm btn-primary btn-raised mt-2"
                            disabled={!cart.length}
                        >
                            Proceed to Checkout
                        </button>
                    ) : (
                        <button className="btn btn-sm btn-primary btn-raised mt-2">
                            <Link
                                to={{
                                    pathname: "/login",
                                    state: { from: "cart" },
                                }}
                            >
                                Login to Checkout
                            </Link>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Cart;