import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getCategories } from "../../functions/category";
import { Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

const CategoryList = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setLoading(true);

        getCategories().then((c) => {
            setCategories(c.data);
            setLoading(false);
        });

        return () => {
            setCategories([]);
        };
    }, []);

    const showCategories = () =>
        categories.map((c) => (
            <div
                key={c._id}
                className="col btn btn-outlined-primary btn-lg btn-block btn-raised m-3"
            >
                <Link to={`/category/${c.slug}`}>{c.name}</Link>
            </div>
        ));

    return (
        <div className="container">
            <div className="row">
                {loading ? (
                    <h4 className="text-center">
                        <Spin
                            indicator={<LoadingOutlined />}
                            className="mr-2"
                        />
                        Loading...
                    </h4>
                ) : (
                    showCategories()
                )}
            </div>
        </div>
    );
};

export default CategoryList;
