import { h } from 'preact';
import DataGrid from "../../internal/DataGrid";
import { getLabel } from "./utils";
import useCoreContext from "../../../core/Context/useCoreContext";
import Button from "../../internal/Button";
import Status from "../../internal/Status";

export default function AccountHolderList(props) {
    const {i18n} = useCoreContext();
    const fields = ['id', 'description', 'status', 'legalEntityId'];
    const columns = fields.map(key => ({ key, label: i18n.get(getLabel(key)) }));

    return (
        <DataGrid
            data={props.accountHolders.accountHolders}
            columns={columns}
            loading={false}
            customCells={{
                id: (key, item) => (
                    !!props.onAccountHolderSelected ? (
                        <Button variant={'link'} onClick={() => props.onAccountHolderSelected({id: item[key]})}>
                            {item[key]}
                        </Button>
                    ) : (
                        item[key]
                    )
                ),
                status: (key, item) => (
                    <Status type={'success'} label={item.key} />
                )
            }}
        />
    );
}
