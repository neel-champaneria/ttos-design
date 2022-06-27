import { useRouter } from "next/router";
import Link from "next/link";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { fetchAppConfig, fetchMenuAction } from "./../src/actions/MenuAction";
import { setQrInfoAction } from "./../src/actions/QrActions";
import SearchedItemCompoent from "../src/components/menuComponents/SearchedItemComponent";

import { Carousel, Button, Offcanvas, Navbar, Spinner } from "react-bootstrap";

const Home = () => {
    const dispatch = useDispatch();
    const router = useRouter();
    const { query } = router;
    let qrInfo = (qrInfo = useSelector((state) => state.QrReducer));

    const [menu, setMenu] = useState([]);
    const [restaurantInfo, setRestaurantInfo] = useState({});
    const [restaurantProfile, setResturantProfile] = useState({});
    const [menuRows, setMenuRows] = useState([]);
    const [searchText, setSearchText] = useState("");
    const [allItemsName, setAllItemsName] = useState([]);
    const [searchMatchItem, setSearchMatchItem] = useState([]);
    const [searchMatchItemRow, setSearchMatchItemRow] = useState([]);
    const [showSearchResult, setShowSearchResult] = useState(false);
    const [showSearchbar, setShowSearchbar] = useState(false);

    const [numOfCategory, setNumOfCategory] = useState(null);

    const [isMenuFetchingLoading, setIsMenuFetchingLoading] = useState(false);
    const [isMenuPrepareLoading, setIsMenuPrepareLoading] = useState(false);

    /* useEffect(() => {
      dispatch(fetchMenuAction());
      if (Object.keys(query).length !== 0) {
        dispatch(
          setQrInfoAction({
            tableId: query.tableId,
            qrId: query.qrId,
            tableName: query.tableName,
          })
        );
      }
    }, [query, qrInfo, dispatch]); */

    useEffect(async () => {
        if (router.isReady) {
            setIsMenuFetchingLoading(true);
            if (
                Object.keys(router.query).length !== 0 &&
                router.query.tableId &&
                router.query.qrId &&
                router.query.tableName
            ) {
                dispatch(
                    setQrInfoAction({
                        tableId: query.tableId,
                        qrId: query.qrId,
                        tableName: query.tableName,
                    })
                );
                const menuResponse = await dispatch(fetchMenuAction(router.query.qrId));
                const restaurantInfoResposne = await dispatch(
                    fetchAppConfig(router.query.qrId)
                );
                if (menuResponse.status) {
                    setMenu(menuResponse.jsonData.menu);
                    setResturantProfile(menuResponse.jsonData.restaurant);
                } else {
                    if (menuResponse.error.qrExpire) {
                        router.replace("/qr-expired");
                    } else {
                        router.replace("/something-wrong");
                    }
                }
                if (restaurantInfoResposne.status) {
                    setRestaurantInfo(restaurantInfoResposne.jsonData);
                } else {
                    if (restaurantInfoResposne.error.qrExpire) {
                        router.replace("/qr-expired");
                    } else {
                        router.replace("/something-wrong");
                    }
                }
                if (menuResponse.status && restaurantInfoResposne.status) {
                    setIsMenuFetchingLoading(false);
                }
            } else {
                if (qrInfo && Object.keys(qrInfo).length !== 0 && qrInfo.qrId) {
                    const menuResponse = await dispatch(fetchMenuAction(qrInfo.qrId));
                    const restaurantInfoResposne = await dispatch(
                        fetchAppConfig(qrInfo.qrId)
                    );
                    if (menuResponse.status) {
                        setMenu(menuResponse.jsonData.menu);
                        setResturantProfile(menuResponse.jsonData.restaurant);
                    } else {
                        if (menuResponse.error.qrExpire) {
                            router.replace("/qr-expired");
                        } else {
                            router.replace("/something-wrong");
                        }
                    }
                    if (restaurantInfoResposne.status) {
                        setRestaurantInfo(restaurantInfoResposne.jsonData);
                    } else {
                        if (restaurantInfoResposne.error.qrExpire) {
                            router.replace("/qr-expired");
                        } else {
                            router.replace("/something-wrong");
                        }
                    }
                    if (menuResponse.status && restaurantInfoResposne.status) {
                        setIsMenuFetchingLoading(false);
                    }
                } else {
                    router.replace("./qr-not-found");
                }
            }
        }
    }, [dispatch, router]);

    // const menu = useSelector((state) => state.menuReducer) || [];
    // qrInfo = useSelector((state) => state.QrReducer);
    // const restaurant = useSelector((state) => state.resReducer);

    useEffect(() => {
        if (menu.length > 0) {
            setIsMenuPrepareLoading(true);
            setNumOfCategory(menu.length);
            let clonedMenu = [...menu];
            let rows = [];
            for (let i = 0; i < clonedMenu.length; i += 2) {
                rows.push([
                    clonedMenu[i],
                    i + 1 < clonedMenu.length ? clonedMenu[i + 1] : null,
                ]);
            }
            setMenuRows(rows);
            const allNames = [];
            for (let i = 0; i < menu.length; i++) {
                for (let j = 0; j < menu[i].items.length; j++) {
                    allNames.push(menu[i].items[j].name);
                }
            }
            setAllItemsName(allNames);
            setIsMenuPrepareLoading(false);
        }
    }, [menu]);

    const onSearch = () => {
        if (searchText === "") {
            return;
        }
        const pattern = RegExp(searchText, "i");

        const items = [];
        for (let i = 0; i < menu.length; i++) {
            for (let j = 0; j < menu[i].items.length; j++) {
                if (pattern.test(menu[i].items[j].name))
                    items.push({ item: menu[i].items[j], category: menu[i] });
            }
        }
        setSearchMatchItem(items);
        const rows = [];
        for (let i = 0; i < items.length; i += 2) {
            rows.push([items[i], i + 1 < items.length ? items[i + 1] : null]);
        }
        setSearchMatchItemRow(rows);
        setShowSearchResult(true);
    };

    useEffect(() => {
        if (searchText === "") {
            setShowSearchResult(false);
        }
    }, [searchText]);

    const clickSearchIcon = () => {
        setShowSearchbar(!showSearchbar);
        setSearchText("");
        setShowSearchResult(false);
    };

    return (
        <>
            {isMenuFetchingLoading ? (
                <>
                    <div className="container d-flex flex-column justify-content-center align-items-center vh-100">
                        <Spinner animation="border" variant="secondary" />
                        <h2>Getting Menu</h2>
                    </div>
                </>
            ) : (
                <>
                    {isMenuPrepareLoading ? (
                        <>
                            <div className="container d-flex flex-column justify-content-center align-items-center vh-100">
                                <Spinner animation="border" variant="secondary" />
                                <h2>Preparing Menu</h2>
                            </div>
                        </>
                    ) : (
                        <>
                            {/* Table Number */}
                            <div className="mb-2">
                                <div className="text-center text-white table_strip">
                                    TABLE {qrInfo.tableName}
                                </div>
                            </div>

                            {/* Restaurant Logo, Name and Search Button */}
                            <div className="container mb-2">
                                <div className="header home-page-header">
                                    <Navbar>
                                        <Navbar.Brand>
                                            {/* <img
                        src="/eatery_logo.png"
                        className="logo-height d-inline-block align-top"
                        alt="React Bootstrap logo"
                      /> */}
                                            {restaurantProfile.logo ? (
                                                <img
                                                    src={restaurantProfile.logo}
                                                    className="logo-height d-inline-block align-top"
                                                    alt="React Bootstrap logo"
                                                />
                                            ) : null}
                                        </Navbar.Brand>
                                        <Navbar.Brand className="header_title">
                                            {restaurantProfile.name}
                                        </Navbar.Brand>
                                        <Navbar.Toggle />
                                        <Navbar.Collapse className="justify-content-end">
                                            <Navbar.Text>
                                                <img
                                                    src="/search.svg"
                                                    alt="search icon"
                                                    onClick={() => {
                                                        clickSearchIcon();
                                                    }}
                                                />
                                            </Navbar.Text>
                                        </Navbar.Collapse>
                                    </Navbar>
                                </div>
                            </div>

                            {/* Search Bar */}
                            {showSearchbar ? (
                                <div className="container mb-2 d-flex">
                                    <input
                                        type="text"
                                        className="form-control border-radius-5"
                                        placeholder="Search"
                                        value={searchText}
                                        onChange={(e) => setSearchText(e.target.value)}
                                    />
                                    <button
                                        onClick={() => onSearch()}
                                        className="btn red-btn search-btn"
                                    >
                                        Search
                                    </button>
                                </div>
                            ) : null}

                            {/* <div className="container">
                {restaurantInfo.logo && (
                  <div className="logo_container_outer_div">
                    <div className="logo_container_inner_div">
                      <img
                        src={restaurantInfo.logo}
                        alt="Restaurant logo"
                        className="logo_container_img"
                      />
                    </div>
                  </div>
                )}
                {restaurantInfo.name && (
                  <>
                    <div className="pt-2">
                      <h1 className="text-center fw-bold mb-3">
                        {restaurantInfo.name}
                      </h1>
                    </div>
                  </>
                )}
              </div> */}

                            {menu && menuRows && numOfCategory && !showSearchResult && (
                                <div>
                                    {/* Carousel */}
                                    {/* <div className="container">
            <Carousel fade controls={false} className="mt-3">
              <Carousel.Item>
                <img
                  className="d-block w-100 img-rounded"
                  src="/pizza.jpg"
                  alt="First slide"
                />
              </Carousel.Item>
              <Carousel.Item>
                <img
                  className="d-block w-100 img-rounded"
                  src="/pizza.jpg"
                  alt="Second slide"
                />
              </Carousel.Item>
              <Carousel.Item>
                <img
                  className="d-block w-100 img-rounded"
                  src="/pizza.jpg"
                  alt="Third slide"
                />
              </Carousel.Item>
            </Carousel>
          </div> */}

                                    {/* Category Title */}
                                    {/*<div className="pt-1">*/}
                                    {/*    <h1 className="text-center fw-bold mb-3">Categories</h1>*/}
                                    {/*</div>*/}

                                    {/* Category List & its details */}
                                    <div className="container">
                                        {/* Category List */}
                                        <div className="category-list-container d-flex pb-2 mb-5">
                                            {/* conditional class: 'is-selected' is for selected category */}
                                            <div className="individual-category d-inline-block is-selected">
                                                <Link href="#">
                                                    <div className="category-list-data-wrapper">
                                                        <div className="category-img-container">
                                                            <img
                                                                className="d-block img-fluid cover-img"
                                                                src="https://i.pinimg.com/474x/89/05/53/890553d4bcd4abf41add46eb72d20261--fish-dishes-seafood-dishes.jpg" alt="Image" />
                                                        </div>

                                                        <h2 className="text-center color-white pt-1 pb-1 text-uppercase fw-bold">
                                                            Sides & Desserts
                                                        </h2>
                                                    </div>
                                                </Link>
                                            </div>
                                            <div className="individual-category d-inline-block">
                                                <Link href="#">
                                                    <div className="category-list-data-wrapper">
                                                        <div className="category-img-container">
                                                            <img
                                                                className="d-block img-fluid cover-img"
                                                                src="https://i.pinimg.com/474x/89/05/53/890553d4bcd4abf41add46eb72d20261--fish-dishes-seafood-dishes.jpg" alt="Image" />
                                                        </div>

                                                        <h2 className="text-center color-white pt-1 pb-1 text-uppercase fw-bold">
                                                            Sides & Desserts
                                                        </h2>
                                                    </div>
                                                </Link>
                                            </div>
                                            <div className="individual-category d-inline-block">
                                                <Link href="#">
                                                    <div className="category-list-data-wrapper">
                                                        <div className="category-img-container">
                                                            <img
                                                                className="d-block img-fluid cover-img"
                                                                src="https://i.pinimg.com/474x/89/05/53/890553d4bcd4abf41add46eb72d20261--fish-dishes-seafood-dishes.jpg" alt="Image" />
                                                        </div>

                                                        <h2 className="text-center color-white pt-1 pb-1 text-uppercase fw-bold">
                                                            Sides & Desserts
                                                        </h2>
                                                    </div>
                                                </Link>
                                            </div>
                                            <div className="individual-category d-inline-block">
                                                <Link href="#">
                                                    <div className="category-list-data-wrapper">
                                                        <div className="category-img-container">
                                                            <img
                                                                className="d-block img-fluid cover-img"
                                                                src="https://i.pinimg.com/474x/89/05/53/890553d4bcd4abf41add46eb72d20261--fish-dishes-seafood-dishes.jpg" alt="Image" />
                                                        </div>

                                                        <h2 className="text-center color-white pt-1 pb-1 text-uppercase fw-bold">
                                                            Sides & Desserts
                                                        </h2>
                                                    </div>
                                                </Link>
                                            </div>
                                            <div className="individual-category d-inline-block">
                                                <Link href="#">
                                                    <div className="category-list-data-wrapper">
                                                        <div className="category-img-container">
                                                            <img
                                                                className="d-block img-fluid cover-img"
                                                                src="https://i.pinimg.com/474x/89/05/53/890553d4bcd4abf41add46eb72d20261--fish-dishes-seafood-dishes.jpg" alt="Image" />
                                                        </div>

                                                        <h2 className="text-center color-white pt-1 pb-1 text-uppercase fw-bold">
                                                            Sides & Desserts
                                                        </h2>
                                                    </div>
                                                </Link>
                                            </div>

                                            <div className="individual-category d-inline-block">
                                                <Link href="#">
                                                    <div className="category-list-data-wrapper">
                                                        <div className="category-img-container">
                                                            <img
                                                                className="d-block img-fluid cover-img"
                                                                src="https://i.pinimg.com/474x/89/05/53/890553d4bcd4abf41add46eb72d20261--fish-dishes-seafood-dishes.jpg" alt="Image" />
                                                        </div>

                                                        <h2 className="text-center color-white pt-1 pb-1 text-uppercase fw-bold">
                                                            Sides & Desserts
                                                        </h2>
                                                    </div>
                                                </Link>
                                            </div>


                                            <div className="individual-category d-inline-block">
                                                <Link href="#">
                                                    <div className="category-list-data-wrapper">
                                                        <div className="category-img-container">
                                                            <img
                                                                className="d-block img-fluid cover-img"
                                                                src="https://i.pinimg.com/474x/89/05/53/890553d4bcd4abf41add46eb72d20261--fish-dishes-seafood-dishes.jpg" alt="Image" />
                                                        </div>

                                                        <h2 className="text-center color-white pt-1 pb-1 text-uppercase fw-bold">
                                                            Sides & Desserts
                                                        </h2>
                                                    </div>
                                                </Link>
                                            </div>


                                            <div className="individual-category d-inline-block">
                                                <Link href="#">
                                                    <div className="category-list-data-wrapper">
                                                        <div className="category-img-container">
                                                            <img
                                                                className="d-block img-fluid cover-img"
                                                                src="https://i.pinimg.com/474x/89/05/53/890553d4bcd4abf41add46eb72d20261--fish-dishes-seafood-dishes.jpg" alt="Image" />
                                                        </div>

                                                        <h2 className="text-center color-white pt-1 pb-1 text-uppercase fw-bold">
                                                            Sides & Desserts
                                                        </h2>
                                                    </div>
                                                </Link>
                                            </div>


                                            <div className="individual-category d-inline-block">
                                                <Link href="#">
                                                    <div className="category-list-data-wrapper">
                                                        <div className="category-img-container">
                                                            <img
                                                                className="d-block img-fluid cover-img"
                                                                src="https://i.pinimg.com/474x/89/05/53/890553d4bcd4abf41add46eb72d20261--fish-dishes-seafood-dishes.jpg" alt="Image" />
                                                        </div>

                                                        <h2 className="text-center color-white pt-1 pb-1 text-uppercase fw-bold">
                                                            Sides & Desserts
                                                        </h2>
                                                    </div>
                                                </Link>
                                            </div>

                                            <div className="individual-category d-inline-block">
                                                <Link href="#">
                                                    <div className="category-list-data-wrapper">
                                                        <div className="category-img-container">
                                                            <img
                                                                className="d-block img-fluid cover-img"
                                                                src="https://i.pinimg.com/474x/89/05/53/890553d4bcd4abf41add46eb72d20261--fish-dishes-seafood-dishes.jpg" alt="Image" />
                                                        </div>

                                                        <h2 className="text-center color-white pt-1 pb-1 text-uppercase fw-bold">
                                                            Sides & Desserts
                                                        </h2>
                                                    </div>
                                                </Link>
                                            </div>

                                            <div className="individual-category d-inline-block">
                                                <Link href="#">
                                                    <div className="category-list-data-wrapper">
                                                        <div className="category-img-container">
                                                            <img
                                                                className="d-block img-fluid cover-img"
                                                                src="https://i.pinimg.com/474x/89/05/53/890553d4bcd4abf41add46eb72d20261--fish-dishes-seafood-dishes.jpg" alt="Image" />
                                                        </div>

                                                        <h2 className="text-center color-white pt-1 pb-1 text-uppercase fw-bold">
                                                            Sides & Desserts
                                                        </h2>
                                                    </div>
                                                </Link>
                                            </div>

                                            <div className="individual-category d-inline-block">
                                                <Link href="#">
                                                    <div className="category-list-data-wrapper">
                                                        <div className="category-img-container">
                                                            <img
                                                                className="d-block img-fluid cover-img"
                                                                src="https://i.pinimg.com/474x/89/05/53/890553d4bcd4abf41add46eb72d20261--fish-dishes-seafood-dishes.jpg" alt="Image" />
                                                        </div>

                                                        <h2 className="text-center color-white pt-1 pb-1 text-uppercase fw-bold">
                                                            Sides & Desserts
                                                        </h2>
                                                    </div>
                                                </Link>
                                            </div>

                                            <div className="individual-category d-inline-block">
                                                <Link href="#">
                                                    <div className="category-list-data-wrapper">
                                                        <div className="category-img-container">
                                                            <img
                                                                className="d-block img-fluid cover-img"
                                                                src="https://i.pinimg.com/474x/89/05/53/890553d4bcd4abf41add46eb72d20261--fish-dishes-seafood-dishes.jpg" alt="Image" />
                                                        </div>

                                                        <h2 className="text-center color-white pt-1 pb-1 text-uppercase fw-bold">
                                                            Sides & Desserts
                                                        </h2>
                                                    </div>
                                                </Link>
                                            </div>

                                            <div className="individual-category d-inline-block">
                                                <Link href="#">
                                                    <div className="category-list-data-wrapper">
                                                        <div className="category-img-container">
                                                            <img
                                                                className="d-block img-fluid cover-img"
                                                                src="https://i.pinimg.com/474x/89/05/53/890553d4bcd4abf41add46eb72d20261--fish-dishes-seafood-dishes.jpg" alt="Image" />
                                                        </div>

                                                        <h2 className="text-center color-white pt-1 pb-1 text-uppercase fw-bold">
                                                            Sides & Desserts
                                                        </h2>
                                                    </div>
                                                </Link>
                                            </div>

                                            <div className="individual-category d-inline-block">
                                                <Link href="#">
                                                    <div className="category-list-data-wrapper">
                                                        <div className="category-img-container">
                                                            <img
                                                                className="d-block img-fluid cover-img"
                                                                src="https://i.pinimg.com/474x/89/05/53/890553d4bcd4abf41add46eb72d20261--fish-dishes-seafood-dishes.jpg" alt="Image" />
                                                        </div>

                                                        <h2 className="text-center color-white pt-1 pb-1 text-uppercase fw-bold">
                                                            Sides & Desserts
                                                        </h2>
                                                    </div>
                                                </Link>
                                            </div>

                                            <div className="individual-category d-inline-block">
                                                <Link href="#">
                                                    <div className="category-list-data-wrapper">
                                                        <div className="category-img-container">
                                                            <img
                                                                className="d-block img-fluid cover-img"
                                                                src="https://i.pinimg.com/474x/89/05/53/890553d4bcd4abf41add46eb72d20261--fish-dishes-seafood-dishes.jpg" alt="Image" />
                                                        </div>

                                                        <h2 className="text-center color-white pt-1 pb-1 text-uppercase fw-bold">
                                                            Sides & Desserts
                                                        </h2>
                                                    </div>
                                                </Link>
                                            </div>

                                            <div className="individual-category d-inline-block">
                                                <Link href="#">
                                                    <div className="category-list-data-wrapper">
                                                        <div className="category-img-container">
                                                            <img
                                                                className="d-block img-fluid cover-img"
                                                                src="https://i.pinimg.com/474x/89/05/53/890553d4bcd4abf41add46eb72d20261--fish-dishes-seafood-dishes.jpg" alt="Image" />
                                                        </div>

                                                        <h2 className="text-center color-white pt-1 pb-1 text-uppercase fw-bold">
                                                            Sides & Desserts
                                                        </h2>
                                                    </div>
                                                </Link>
                                            </div>

                                            <div className="individual-category d-inline-block">
                                                <Link href="#">
                                                    <div className="category-list-data-wrapper">
                                                        <div className="category-img-container">
                                                            <img
                                                                className="d-block img-fluid cover-img"
                                                                src="https://i.pinimg.com/474x/89/05/53/890553d4bcd4abf41add46eb72d20261--fish-dishes-seafood-dishes.jpg" alt="Image" />
                                                        </div>

                                                        <h2 className="text-center color-white pt-1 pb-1 text-uppercase fw-bold">
                                                            Sides & Desserts
                                                        </h2>
                                                    </div>
                                                </Link>
                                            </div>

                                        </div>


                                        {/* List Of Category Items */}
                                        <div className="container">

                                            <div className="row justify-content-lg-center pb-2 mb-5">

                                                        <div className="col-6 col-sm-4 col-md-3 mb-3">
                                                    <div className="item-details-container">
                                                        <img className="d-block img-fluid cover-img" src="/item-placeholder-square.png" alt="Image" />
                                                        <div className="color-white p-2 product-data-container">
                                                            <p className="line_clamp height_44 mb5">
                                                                A1 Seafood Treasure Pot
                                                            </p>
                                                            <p className="small_para">$ 68.00</p>
                                                            <div>
                                                                <div className="d-flex justify-content-between mt-3">
                                                                    {/* Decrease qty */}

                                                                    <button type="button" className="red-btn right-border-radius  btn btn-danger">
                                                                        <i className="fa fa-minus"></i>
                                                                    </button>
                                                                    {/* Qty */}
                                                                    <span className="mid_quantity"></span>
                                                                    {/* Increase qty */}
                                                                    <Button className="red-btn left-border-radius btn btn-danger"
                                                                        variant="danger">
                                                                        <i className="fa fa-plus"></i>
                                                                    </Button>
                                                                </div>

                                                                {/*add qty*/}
                                                                <button type="button" className="w-100 btn btn-danger">Add</button>

                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                        <div className="col-6 col-sm-4 col-md-3 mb-3">
                                                    <div className="item-details-container">
                                                                <img className="d-block img-fluid cover-img" src="/item-placeholder-square.png" alt="Image" />
                                                        <div className="color-white p-2 product-data-container">
                                                            <p className="line_clamp height_44 mb5">
                                                                A1 Seafood Treasure Pot
                                                            </p>
                                                            <p className="small_para">$ 68.00</p>

                                                            <div>
                                                                <div className="d-flex justify-content-between mt-3">
                                                                    {/* Decrease qty */}

                                                                    <button type="button" className="red-btn right-border-radius  btn btn-danger">
                                                                        <i className="fa fa-minus"></i>
                                                                    </button>
                                                                    {/* Qty */}
                                                                    <span className="mid_quantity"></span>
                                                                    {/* Increase qty */}
                                                                    <Button className="red-btn left-border-radius btn btn-danger"
                                                                        variant="danger">
                                                                        <i className="fa fa-plus"></i>
                                                                    </Button>
                                                                </div>

                                                                {/*add qty*/}
                                                                <button type="button" className="w-100 btn btn-danger">Add</button>

                                                            </div>
                                                        </div>
                                                    </div>
                                                        </div>

                                                        <div className="col-6 col-sm-4 col-md-3 mb-3">
                                                            <div className="item-details-container">
                                                                <img className="d-block img-fluid cover-img" src="/item-placeholder-square.png" alt="Image" />
                                                                <div className="color-white p-2 product-data-container">
                                                                    <p className="line_clamp height_44 mb5">
                                                                        A1 Seafood Treasure Pot
                                                                    </p>
                                                                    <p className="small_para">$ 68.00</p>

                                                                    <div>
                                                                        <div className="d-flex justify-content-between mt-3">
                                                                            {/* Decrease qty */}

                                                                            <button type="button" className="red-btn right-border-radius  btn btn-danger">
                                                                                <i className="fa fa-minus"></i>
                                                                            </button>
                                                                            {/* Qty */}
                                                                            <span className="mid_quantity"></span>
                                                                            {/* Increase qty */}
                                                                            <Button className="red-btn left-border-radius btn btn-danger"
                                                                                variant="danger">
                                                                                <i className="fa fa-plus"></i>
                                                                            </Button>
                                                                        </div>

                                                                        {/*add qty*/}
                                                                        <button type="button" className="w-100 btn btn-danger">Add</button>

                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="col-6 col-sm-4 col-md-3 mb-3">
                                                            <div className="item-details-container">
                                                                <img className="d-block img-fluid cover-img" src="/item-placeholder-square.png" alt="Image" />
                                                                <div className="color-white p-2 product-data-container">
                                                                    <p className="line_clamp height_44 mb5">
                                                                        A1 Seafood Treasure Pot
                                                                    </p>
                                                                    <p className="small_para">$ 68.00</p>

                                                                    <div>
                                                                        <div className="d-flex justify-content-between mt-3">
                                                                            {/* Decrease qty */}

                                                                            <button type="button" className="red-btn right-border-radius  btn btn-danger">
                                                                                <i className="fa fa-minus"></i>
                                                                            </button>
                                                                            {/* Qty */}
                                                                            <span className="mid_quantity"></span>
                                                                            {/* Increase qty */}
                                                                            <Button className="red-btn left-border-radius btn btn-danger"
                                                                                variant="danger">
                                                                                <i className="fa fa-plus"></i>
                                                                            </Button>
                                                                        </div>

                                                                        {/*add qty*/}
                                                                        <button type="button" className="w-100 btn btn-danger">Add</button>

                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="col-6 col-sm-4 col-md-3 mb-3">
                                                            <div className="item-details-container">
                                                                <img className="d-block img-fluid cover-img" src="/item-placeholder-square.png" alt="Image" />
                                                                <div className="color-white p-2 product-data-container">
                                                                    <p className="line_clamp height_44 mb5">
                                                                        A1 Seafood Treasure Pot
                                                                    </p>
                                                                    <p className="small_para">$ 68.00</p>

                                                                    <div>
                                                                        <div className="d-flex justify-content-between mt-3">
                                                                            {/* Decrease qty */}

                                                                            <button type="button" className="red-btn right-border-radius  btn btn-danger">
                                                                                <i className="fa fa-minus"></i>
                                                                            </button>
                                                                            {/* Qty */}
                                                                            <span className="mid_quantity"></span>
                                                                            {/* Increase qty */}
                                                                            <Button className="red-btn left-border-radius btn btn-danger"
                                                                                variant="danger">
                                                                                <i className="fa fa-plus"></i>
                                                                            </Button>
                                                                        </div>

                                                                        {/*add qty*/}
                                                                        <button type="button" className="w-100 btn btn-danger">Add</button>

                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Below Are The Temporary Changes */}

                                    {/* <div className="container category_container">
                    {menu.map((category, idx) => {
                      return (
                        <>
                          {numOfCategory - 1 === idx ? (
                            <>
                              <div
                                className="row justify-content-md-center p-2 mb-5"
                                key={idx}
                              >
                                <div
                                  className="col-12 category_block"
                                  key={category.id}
                                >
                                  <div className="category_block_highlight"></div>
                                  <Link href={`/category/${category.id}`}>
                                    <h2 className="text-center fw-bold category_block_name">
                                      {category.name}
                                    </h2>
                                  </Link>
                                </div>
                              </div>
                            </>
                          ) : (
                            <>
                              <div
                                className="row justify-content-md-center p-2 mb-1"
                                key={idx}
                              >
                                <div
                                  className="col-12 category_block"
                                  key={category.id}
                                >
                                  <div className="category_block_highlight"></div>
                                  <Link href={`/category/${category.id}`}>
                                    <h2 className="text-center fw-bold category_block_name">
                                      {category.name}
                                    </h2>
                                  </Link>
                                </div>
                              </div>
                            </>
                          )}
                        </>
                      );
                    })}
                  </div> */}
                                </div>
                            )}

                            {/* 
          Search Component
          This loads when search keyword is entered in serach bar and search button is pressed.
          If search keyword matches any item name then SearchedItemCompoent will load,
          otherwise it will show "No items found" and button to see all categories.
      */}

                            {showSearchResult && (
                                <>
                                    {searchMatchItem.length > 0 ? (
                                        <>
                                            <SearchedItemCompoent
                                                searchMatchItemRow={searchMatchItemRow}
                                            />
                                        </>
                                    ) : (
                                        <>
                                            <div className="container text-center mt-5">
                                                <h2 className="">No items found</h2>
                                                <Button
                                                    className="red-btn"
                                                    variant="danger"
                                                    onClick={() => clickSearchIcon()}
                                                >
                                                    See All Category
                                                </Button>
                                            </div>
                                        </>
                                    )}
                                </>
                            )}
                        </>
                    )}
                </>
            )}
        </>
    );
};

export default Home;
