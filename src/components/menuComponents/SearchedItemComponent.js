import Button from "react-bootstrap/Button";
import SingleItem from "./SingleItem";

const SearchedItemCompoent = ({ searchMatchItemRow }) => {
  return (
    <>
      <div className="container">
        {searchMatchItemRow.map((row, idx) => (
          <div className="row justify-content-md-center pb-2 mb-5" key={idx}>
            {row[0] && (
              <div className="col-6" key={row[0].item.id}>
                <SingleItem category={row[0].category} item={row[0].item} />
              </div>
            )}
            {row[1] ? (
              <div className="col-6" key={row[1].item.id}>
                <SingleItem category={row[1].category} item={row[1].item} />
              </div>
            ) : (
              <div className="col-6"></div>
            )}
          </div>
        ))}
      </div>
    </>
  );
};

export default SearchedItemCompoent;
