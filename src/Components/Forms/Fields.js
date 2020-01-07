import TextInput from 'Components/Controls/TextInput';
import DropdownList from 'Components/Controls/DropdownList';
import TagsInput from 'Components/Controls/TagsInput';
import toFormField from './toFormField';
import CheckboxInput from 'Components/Controls/Checkbox';
import UploadInput from 'Components/Controls/UploadInput';
import TextArea from 'Components/Controls/TextArea';
import RadioButtonInput from 'Components/Controls/RadioButton';
import RadioButtonGroupInput from 'Components/Controls/RadioButtonGroup';
import CheckBoxGroupInput from 'Components/Controls/CheckboxGroup';
import LocaleSelect from 'Components/Controls/Dropdowns/LocaleSelect';
import LocationInput from 'Components/Controls/LocationInput';
import SelectDropdown from 'Components/Controls/Dropdowns/Select';
import SelectInput from 'Components/Controls/Dropdowns/Select';
import SelectGroupsInput from 'Components/Controls/Dropdowns/SelectGroups';
import DatePicker from 'Components/Controls/DatePicker';
import { CreatableSelect, AsyncCreatableSelect, AsyncSelect } from 'Components/Controls/Select';
import PhoneInput from 'Components/Forms/PhoneInput';
import KeywordsInput from 'Components/Filters/Editors/KeywordsList/KeywordsInput';

export const PhoneField = toFormField(PhoneInput);
export const TextField = toFormField(TextInput);
export const UploadField = toFormField(UploadInput);
export const TextAreaField = toFormField(TextArea);
export const DropdownField = toFormField(DropdownList);
export const LocaleDropdownField = toFormField(LocaleSelect);
export const CustomSelect = toFormField(SelectDropdown);
export const TagsField = toFormField(TagsInput);
export const Checkbox = toFormField(CheckboxInput);
export const LocationField = toFormField(LocationInput);
export const DateField = toFormField(DatePicker);

export const RadioButton = toFormField(RadioButtonInput);
export const RadioButtonGroup = toFormField(RadioButtonGroupInput);
export const CheckBoxGroup = toFormField(CheckBoxGroupInput);

export const Select = toFormField(SelectInput);
export const SelectAsync = toFormField(AsyncSelect);
export const SelectCreatable = toFormField(CreatableSelect);
export const SelectAsyncCreatable = toFormField(AsyncCreatableSelect);

export const SelectGroups = toFormField(SelectGroupsInput);

export const KeywordsInputField = toFormField(KeywordsInput);
