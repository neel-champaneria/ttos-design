import { useRouter } from "next/router";
import Link from "next/link";

import { useDispatch, useSelector } from "react-redux";

import { useEffect, useState } from "react";
import SearchedItemCompoent from "./../../src/components/menuComponents/SearchedItemComponent";
import SingleItem from "../../src/components/menuComponents/SingleItem";

import { Button, Navbar, Spinner } from "react-bootstrap";
import { fetchAppConfig, fetchMenuAction } from "../../src/actions/MenuAction";

const CategoryPage = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { query } = router;

  // const menu = useSelector((state) => state.menuReducer) || [];
  const qrInfo = useSelector((state) => state.QrReducer) || {
    qrFetching: true,
  };
  const [menu, setMenu] = useState([]);
  const [restaurantInfo, setRestaurantInfo] = useState({});

  const [category, setCategory] = useState([]);
  const [itemRows, setItemsRows] = useState([]);

  const [searchText, setSearchText] = useState("");
  const [searchMatchItem, setSearchMatchItem] = useState([]);
  const [searchMatchItemRow, setSearchMatchItemRow] = useState([]);
  const [showSearchResult, setShowSearchResult] = useState(false);
  const [showSearchbar, setShowSearchbar] = useState(false);

  const [isMenuFetchingLoading, setIsMenuFetchingLoading] = useState(false);
  const [isPreparingCategory, setIsPreparingCategory] = useState(false);
  // console.log("[categoryId] outside qrInfo: ", qrInfo);

  useEffect(async () => {
    // console.log("[categoryId] qrInfo: ", qrInfo);
    if (
      Object.keys(qrInfo).length !== 0 &&
      qrInfo.tableId &&
      qrInfo.qrId &&
      qrInfo.tableName
    ) {
      setIsMenuFetchingLoading(true);
      const menuResponse = await dispatch(fetchMenuAction(qrInfo.qrId));
      const restaurantInfoResposne = await dispatch(
        fetchAppConfig(qrInfo.qrId)
      );
      if (menuResponse.status) {
        setMenu(menuResponse.jsonData.menu);
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
    } else if (!qrInfo.qrId) {
      router.replace("/qr-not-found");
    }
  }, [router, qrInfo]);

  useEffect(() => {
    if (menu.length > 0) {
      setIsPreparingCategory(true);
      const [currentCatogory] = menu.filter(
        (category) => category.id === parseInt(query.categoryId)
      );
      setCategory(currentCatogory);
      const { items } = currentCatogory;
      let rows = [];
      for (let i = 0; i < items.length; i += 2) {
        rows.push([items[i], i + 1 < items.length ? items[i + 1] : null]);
      }
      setItemsRows(rows);
      setIsPreparingCategory(false);
    }
  }, [menu, query]);

  const onSearch = () => {
    if (searchText === "") {
      return;
    }
    const pattern = RegExp(searchText, "i");
    const items = [];
    for (let i = 0; i < category.items.length; i++) {
      if (pattern.test(category.items[i].name))
        items.push({ item: category.items[i], category: category });
    }
    setSearchMatchItem(items);
    const rows = [];
    for (let i = 0; i < items.length; i += 2) {
      rows.push([items[i], i + 1 < items.length ? items[i + 1] : null]);
    }
    setSearchMatchItemRow(rows);
    setShowSearchResult(true);
  };

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
          {isPreparingCategory ? (
            <>
              <div className="container d-flex flex-column justify-content-center align-items-center vh-100">
                <Spinner animation="border" variant="secondary" />
                <h2>Preparing Categoy</h2>
              </div>
            </>
          ) : (
            <>
              {category && itemRows && (
                <>
                  {/* Table Number */}
                  <div className="mb-2">
                    <div className="text-center text-white table_strip">
                      TABLE {qrInfo.tableName}
                    </div>
                  </div>

                  {/* Back Arrow, Category Name, Search Button */}
                  <div className="container mb-2">
                    <div className="header">
                      <Navbar>
                        <Navbar.Brand>
                          <Link href="/">
                            <img
                              src="/prev.svg"
                              alt="previous"
                              className="cursor-pointer"
                            />
                          </Link>
                          <h1 className="menu_title ml10">{category.name}</h1>
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

                  {/* Search Box and Search button */}
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

                  {/* List Of Category Items */}
                  <div className="container">
                    {itemRows &&
                      !showSearchResult &&
                      itemRows.map((row, idx) => {
                        return (
                          <div
                            className="row justify-content-md-center pb-2 mb-5"
                            key={idx}
                          >
                            {row[0] && (
                              <div className="col-6" key={row[0].id}>
                                <SingleItem category={category} item={row[0]} />
                              </div>
                            )}
                            {row[1] ? (
                              <div className="col-6" key={row[1].id}>
                                <SingleItem category={category} item={row[1]} />
                              </div>
                            ) : (
                              <div className="col-6"></div>
                            )}
                          </div>
                        );
                      })}
                  </div>
                </>
              )}

              {/* 
          Search Component
          This loads when search keyword is entered in serach bar and search button is pressed.
          If search keyword matches any item name then SearchedItemCompoent will load,
          otherwise it will show "No items found" and button to see all items from category.
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
                          See all items from {category.name}
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

export default CategoryPage;
